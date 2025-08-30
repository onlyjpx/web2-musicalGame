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
    .replace(/\s+/g, ' ') 
    .trim();
}

// Lógica do levenshtein para aceitar nomes de músicas não exatamente iguais
function levenshtein(a, b, max = 5) {
  if (a === b) return 0;
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;
  // garante o mais curto
  if (lenA > lenB) return levenshtein(b, a, max);
  let prev = new Array(lenA + 1);
  let curr = new Array(lenA + 1);
  for (let i = 0; i <= lenA; i++) prev[i] = i;
  for (let j = 1; j <= lenB; j++) {
    const bj = b.charCodeAt(j - 1);
    curr[0] = j;
    let minInRow = curr[0];
    for (let i = 1; i <= lenA; i++) {
      const cost = a.charCodeAt(i - 1) === bj ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,      // deleta
        curr[i - 1] + 1,  // insere
        prev[i - 1] + cost // substitui
      );
      if (curr[i] < minInRow) minInRow = curr[i];
    }
    if (max !== null && minInRow > max) return max + 1; // saída antecipada
    const temp = prev; prev = curr; curr = temp;
  }
  return prev[lenA];
}

function similarity(a, b) { // Lógica de similaridade
  if (!a || !b) return 0;
  const dist = levenshtein(a, b, 8);
  const maxLen = Math.max(a.length, b.length);
  return 1 - dist / maxLen;
}

function gerarSessionId() { // gera um id para a sessão atual
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function startGame(req, res) { // lógica de início de jogo
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
  roundStartedAt: null,
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

export function getCurrent(req, res) { // lógica para obter o estado atual do jogo
  const { sessionId } = req.params;
  const s = sessions.get(sessionId);
  if (!s) return res.status(404).json({ error: { code: 'SESSAO_INVALIDA', message: 'Sessão não encontrada' } });
  if (s.current >= s.tracks.length) return res.json({ finished: true, score: s.score, totalRounds: s.tracks.length });
  const track = s.tracks[s.current];
  const cfg = DIFFICULTY_CONFIG[s.dificuldade] || DIFFICULTY_CONFIG.FACIL;
  if (!s.roundStartedAt) {
    s.roundStartedAt = Date.now();
  }
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

export async function submitGuess(req, res) { // lógica para enviar palpite do nome da música + persistência de tentativa
  const { sessionId } = req.params;
  const { answer } = req.body;
  if (typeof answer !== 'string') return res.status(400).json({ error: { code: 'RESPOSTA_OBRIGATORIA', message: 'Resposta obrigatória' } });
  const s = sessions.get(sessionId);
  if (!s) return res.status(404).json({ error: { code: 'SESSAO_INVALIDA', message: 'Sessão não encontrada' } });
  if (s.current >= s.tracks.length) return res.status(400).json({ error: { code: 'SESSAO_FINALIZADA', message: 'Sessão já finalizada' } });
  const track = s.tracks[s.current];
  const cfg = DIFFICULTY_CONFIG[s.dificuldade] || DIFFICULTY_CONFIG.FACIL;
  // Remove sufixos entre parênteses do título (ex: "(remaster 2011)") porque isso não faz parte do nome da música
  const tituloBase = track.titulo.replace(/\([^)]*\)/g, ' ');
  const normalizedAnswer = normalizarTexto(answer);
  const normalizedTitulo = normalizarTexto(track.titulo);
  const normalizedTituloBase = normalizarTexto(tituloBase);
  let correta = false;
  let matchType = null;
  if (normalizedAnswer && normalizedTituloBase) {
    // 1. Igual exato
    if (normalizedAnswer === normalizedTitulo || normalizedAnswer === normalizedTituloBase) {
      correta = true; matchType = 'exact';
    }
    // 2. Substring (>=3)
    else if (normalizedAnswer.length >= 3 && (normalizedTituloBase.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedTituloBase))) {
      correta = true; matchType = 'substring';
    } else {
      const tokens = normalizedAnswer.split(' ').filter(t => t.length >= 3);
      if (tokens.length && tokens.every(t => normalizedTituloBase.includes(t))) {
        correta = true; matchType = 'tokens';
      } else {
        // 4. Fuzzy similarity (Levenshtein). Ajusta threshold conforme tamanho
        const sim = similarity(normalizedAnswer, normalizedTituloBase);
        // thresholds: pequeno (<6) exige >=0.8, médio (<12) >=0.75, senão >=0.7
        const threshold = normalizedTituloBase.length < 6 ? 0.8 : normalizedTituloBase.length < 12 ? 0.75 : 0.7;
        if (sim >= threshold) {
          correta = true; matchType = 'fuzzy';
        }
      }
    }
  }
  if (correta) {
    s.score += cfg.pontos;
  }
  // tempo de resposta em segundos (desde início da rodada)
  const tempoResposta = s.roundStartedAt ? (Date.now() - s.roundStartedAt) / 1000 : null;
  // Persistir tentativa se houver usuário autenticado
  let attemptId = null;
  if (s.userId) {
    try {
      const tentativa = await prisma.tentativa.create({
        data: {
          usuarioId: s.userId,
          desafioId: s.desafioId,
          acertou: correta,
          tempoResposta: tempoResposta != null ? Number(tempoResposta.toFixed(3)) : null,
          pontos: correta ? cfg.pontos : 0,
        }
      });
      attemptId = tentativa.id;
    } catch (err) {
      console.error('Falha ao registrar tentativa:', err);
    }
  }
  const payload = {
    correta,
    matchType,
    titulo: track.titulo,
    artista: track.artista,
    score: s.score,
    round: s.current + 1,
    totalRounds: s.tracks.length,
    tempoResposta,
    attemptId,
  };
  s.current += 1; // avança para próxima
  // reset start time para próxima rodada
  s.roundStartedAt = null;
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
