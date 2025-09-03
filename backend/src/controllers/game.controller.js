import prisma from '../prisma/client.js';
import { buscarMusicaDeezerPorId } from '../services/deezer.service.js';

// Sessões em memória (MVP). Em produção usar Redis ou persistência.
const sessions = new Map();

// Configurações de jogo por dificuldade
// base: pontos fixos por acerto
// maxBonus: bônus máximo possível (acerto instantâneo)
const DIFFICULTY_CONFIG = {
  FACIL: { snippetSeconds: 10, base: 8,  maxBonus: 12 },
  MEDIO: { snippetSeconds: 7,  base: 12, maxBonus: 18 },
  DIFICIL: { snippetSeconds: 5,  base: 18, maxBonus: 27 },
  MUITO_DIFICIL: { snippetSeconds: 3,  base: 26, maxBonus: 39 },
  EXTREMO: { snippetSeconds: 2,  base: 38, maxBonus: 57 },
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
  correctCount: 0,
  guessCount: 0,
    guesses: [], // {acertou, tempoResposta, pontos}
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
  let pontosGanhos = 0;
  let bonusTempo = 0;
  let pontosBase = 0;
  if (correta) {
    // tempo de resposta em segundos (calculado abaixo). Para o bônus consideramos tempo válido
    const tempoPrev = s.roundStartedAt ? (Date.now() - s.roundStartedAt) / 1000 : null;
    const snippet = cfg.snippetSeconds;
    const tempoConsiderado = tempoPrev != null ? Math.min(Math.max(tempoPrev, 0), snippet) : snippet;
    // razão 0..1 (0 = instantâneo, 1 = levou todo o preview)
    const ratio = snippet > 0 ? (tempoConsiderado / snippet) : 1;
    // curva levemente exponencial para recompensar muito respostas rápidas
    // bonus decresce com ratio^1.25
    bonusTempo = Math.round(cfg.maxBonus * Math.pow(1 - ratio, 1.25));
    if (bonusTempo < 0) bonusTempo = 0;
    pontosBase = cfg.base;
    pontosGanhos = pontosBase + bonusTempo;
    s.score += pontosGanhos;
  }
  // tempo de resposta em segundos (desde início da rodada)
  const tempoResposta = s.roundStartedAt ? (Date.now() - s.roundStartedAt) / 1000 : null;
  // Atualiza estatísticas de sessão (não persiste ainda)
  if (correta) s.correctCount += 1;
  s.guessCount += 1;
  // registra tentativa local para futura persistência
  s.guesses.push({
    acertou: correta,
    tempoResposta: tempoResposta != null ? Number(tempoResposta.toFixed(3)) : null,
    pontos: correta ? pontosGanhos : 0,
  });
  let attemptId = null; // será populado somente no final agora
  const payload = {
    correta,
    matchType,
    titulo: track.titulo,
    artista: track.artista,
  score: s.score,
  pontosGanhos: correta ? pontosGanhos : 0,
  pontosBase: correta ? pontosBase : 0,
  bonusTempo: correta ? bonusTempo : 0,
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
    if (s.userId && s.guesses.length) {
      try {
        await prisma.tentativa.createMany({
          data: s.guesses.map(g => ({
            usuarioId: s.userId,
            desafioId: s.desafioId,
            acertou: g.acertou,
            tempoResposta: g.tempoResposta,
            pontos: g.pontos,
          })),
        });
      } catch (err) {
        console.error('Falha ao registrar tentativas:', err);
      }
    }
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
