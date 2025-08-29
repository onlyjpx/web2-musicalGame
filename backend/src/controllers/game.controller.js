import prisma from '../prisma/client.js';
import { buscarMusicaDeezerPorId } from '../services/deezer.service.js';

// Sessões em memória (MVP). Em produção usar Redis ou persistência.
const sessions = new Map();

// Configurações de jogo por dificuldade
const DIFFICULTY_CONFIG = {
  FACIL: { snippetSeconds: 10, pontos: 10 },
  MEDIO: { snippetSeconds: 7, pontos: 15 },
  DIFICIL: { snippetSeconds: 5, pontos: 25 },
  MUITO_DIFICIL: { snippetSeconds: 3, pontos: 35 },
  EXTREMO: { snippetSeconds: 2, pontos: 50 },
};

function normalizarTexto(txt) {
  if (!txt) return '';
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}

function gerarSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function startGame(req, res) {
  const { desafioId } = req.params;
  try {
    const desafio = await prisma.desafio.findUnique({
      where: { id: Number(desafioId) },
      include: { musicas: true },
    });
    if (!desafio) return res.status(404).json({ error: { code: 'DESAFIO_NAO_ENCONTRADO', message: 'Desafio não encontrado' } });
    if (!desafio.musicas.length) return res.status(400).json({ error: { code: 'DESAFIO_SEM_MUSICAS', message: 'Desafio sem músicas' } });

    const tracksDetalhadas = await Promise.all(
      desafio.musicas.map(async (dm) => {
        const deezer = await buscarMusicaDeezerPorId(dm.deezerId);
        if (!deezer) return null;
        return {
          deezerId: dm.deezerId,
            titulo: deezer.titulo,
            artista: deezer.artista,
            preview: deezer.preview,
            imagem: deezer.imagem,
        };
      })
    );
    const tracks = tracksDetalhadas.filter(Boolean);
    if (!tracks.length) return res.status(400).json({ error: { code: 'MUSICAS_INDISPONIVEIS', message: 'Não foi possível carregar músicas' } });

    // Embaralha
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }

    const cfg = DIFFICULTY_CONFIG[desafio.dificuldade] || DIFFICULTY_CONFIG.FACIL;
    const sessionId = gerarSessionId();
    sessions.set(sessionId, {
      id: sessionId,
      userId: req.usuario?.id || null,
      desafioId: desafio.id,
      dificuldade: desafio.dificuldade,
      tracks,
      current: 0,
      score: 0,
      createdAt: Date.now(),
    });

    res.json({
      sessionId,
      totalRounds: tracks.length,
      dificuldade: desafio.dificuldade,
      snippetSeconds: cfg.snippetSeconds,
    });
  } catch (e) {
    console.error('startGame error', e);
    res.status(500).json({ error: { code: 'GAME_START_ERRO', message: 'Erro ao iniciar jogo' } });
  }
}

export function getCurrent(req, res) {
  const { sessionId } = req.params;
  const s = sessions.get(sessionId);
  if (!s) return res.status(404).json({ error: { code: 'SESSAO_INVALIDA', message: 'Sessão não encontrada' } });
  if (s.current >= s.tracks.length) return res.json({ finished: true, score: s.score, totalRounds: s.tracks.length });
  const track = s.tracks[s.current];
  const cfg = DIFFICULTY_CONFIG[s.dificuldade] || DIFFICULTY_CONFIG.FACIL;
  res.json({
    round: s.current + 1,
    totalRounds: s.tracks.length,
    preview: track.preview,
    artista: track.artista,
    imagem: track.imagem,
    snippetSeconds: cfg.snippetSeconds,
    score: s.score,
  });
}

export function submitGuess(req, res) {
  const { sessionId } = req.params;
  const { answer } = req.body;
  if (typeof answer !== 'string') return res.status(400).json({ error: { code: 'RESPOSTA_OBRIGATORIA', message: 'Resposta obrigatória' } });
  const s = sessions.get(sessionId);
  if (!s) return res.status(404).json({ error: { code: 'SESSAO_INVALIDA', message: 'Sessão não encontrada' } });
  if (s.current >= s.tracks.length) return res.status(400).json({ error: { code: 'SESSAO_FINALIZADA', message: 'Sessão já finalizada' } });
  const track = s.tracks[s.current];
  const cfg = DIFFICULTY_CONFIG[s.dificuldade] || DIFFICULTY_CONFIG.FACIL;
  // Remove sufixos entre parênteses do título (ex: "(remaster 2011)") para comparação mais justa
  const tituloBase = track.titulo.replace(/\([^)]*\)/g, ' ');
  const normalizedAnswer = normalizarTexto(answer);
  const normalizedTitulo = normalizarTexto(track.titulo);
  const normalizedTituloBase = normalizarTexto(tituloBase);
  // Critérios de acerto:
  // 1. Igualdade exata com título completo OU base
  // 2. Resposta é substring do título base (>= 3 chars) OU título base contém resposta
  // 3. Todas as palavras (>=3 chars) da resposta aparecem no título base
  let correta = false;
  if (normalizedAnswer && normalizedTituloBase) {
    if (normalizedAnswer === normalizedTitulo || normalizedAnswer === normalizedTituloBase) {
      correta = true;
    } else if (normalizedAnswer.length >= 3 && (normalizedTituloBase.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedTituloBase))) {
      correta = true;
    } else {
      const tokens = normalizedAnswer.split(' ').filter(t => t.length >= 3);
      if (tokens.length && tokens.every(t => normalizedTituloBase.includes(t))) {
        correta = true;
      }
    }
  }
  if (correta) {
    s.score += cfg.pontos;
  }
  const payload = {
    correta,
    titulo: track.titulo,
    artista: track.artista,
    score: s.score,
    round: s.current + 1,
    totalRounds: s.tracks.length,
  };
  s.current += 1; // avança para próxima
  if (s.current >= s.tracks.length) {
    payload.finished = true;
  }
  res.json(payload);
}

// Limpeza simples de sessões antigas (>2h)
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (now - s.createdAt > 2 * 60 * 60 * 1000) {
      sessions.delete(id);
    }
  }
}, 30 * 60 * 1000);
