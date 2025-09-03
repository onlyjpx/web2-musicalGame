import prisma from '../prisma/client.js';
import { parsePositiveInt, normalizarDificuldade } from '../utils/validation.js';

// GET /ranking/global?limit=50&offset=0&periodo=all&dificuldade=FACIL
// Observação: Tentativa não possui createdAt. Usamos createdAt do Desafio para filtro temporal aproximado.
export async function rankingGlobal(req, res) {
  try {
  const { limit = '50', offset = '0', periodo = 'all', dificuldade } = req.query;
  const takeReq = parsePositiveInt(limit, 50);
  const skipReq = parsePositiveInt(offset, 0);
  const take = Math.min(100, Math.max(1, takeReq || 50));
  const skip = Math.max(0, skipReq || 0);
  const periodoSan = typeof periodo === 'string' ? periodo.toLowerCase() : 'all';
  const dificuldadeSan = dificuldade ? normalizarDificuldade(dificuldade) : null;

    const where = {};
    if (dificuldadeSan) where.desafio = { dificuldade: dificuldadeSan };
    if (periodoSan !== 'all') {
      const now = new Date();
      let start;
      if (periodoSan === 'dia') start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (periodoSan === 'semana') {
        const day = now.getDay();
        const diff = (day + 6) % 7; // segunda
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      } else if (periodoSan === 'mes') start = new Date(now.getFullYear(), now.getMonth(), 1);
      if (start) where.desafio = { ...(where.desafio||{}), createdAt: { gte: start } };
    }

    // cada linha em tentativa representa um palpite individual somente de desafios finalizados (persistimos tudo ao final).
    const tentativas = await prisma.tentativa.findMany({
      where,
      orderBy: { id: 'asc' },
      select: { id: true, usuarioId: true, pontos: true, acertou: true, tempoResposta: true, usuario: { select: { id: true, nome: true, picture: true } } }
    });

    const mapa = new Map(); // usuarioId -> stats
    for (const t of tentativas) {
      const uRef = t.usuario;
      const entry = mapa.get(t.usuarioId) || { usuarioId: t.usuarioId, nome: uRef?.nome, picture: uRef?.picture, pontos: 0, tentativas: 0, acertos: 0, tempoTotal: 0, temposConsiderados: 0 };
      entry.pontos += t.pontos;
      entry.tentativas += 1;
      if (t.acertou) entry.acertos += 1;
      if (typeof t.tempoResposta === 'number') { entry.tempoTotal += t.tempoResposta; entry.temposConsiderados += 1; }
      mapa.set(t.usuarioId, entry);
    }
    let lista = Array.from(mapa.values()).map(r => ({
      ...r,
      acuracia: r.tentativas ? +((r.acertos / r.tentativas) * 100).toFixed(1) : 0,
      mediaTempo: r.temposConsiderados ? +(r.tempoTotal / r.temposConsiderados).toFixed(2) : null,
      pontosPorTentativa: r.tentativas ? +(r.pontos / r.tentativas).toFixed(1) : 0
    }));
    lista.sort((a,b)=> b.pontos - a.pontos || b.acuracia - a.acuracia || (a.mediaTempo ?? 9999) - (b.mediaTempo ?? 9999) || a.nome.localeCompare(b.nome));
    const slice = lista.slice(skip, skip + take).map((r,i)=> ({
      posicao: skip + i + 1,
      usuarioId: r.usuarioId,
      nome: r.nome,
      picture: r.picture,
      pontos: r.pontos,
      tentativas: r.tentativas,
      acertos: r.acertos,
      acuracia: r.acuracia,
      mediaTempo: r.mediaTempo,
      pontosPorTentativa: r.pontosPorTentativa
    }));
  res.json({ ranking: slice, total: lista.length, limit: take, offset: skip, periodo: periodoSan, dificuldade: dificuldadeSan });
  } catch (e) {
    console.error('rankingGlobal error', e);
    res.status(500).json({ error: { code: 'RANKING_ERRO', message: 'Falha ao carregar ranking' } });
  }
}

export default { rankingGlobal };
