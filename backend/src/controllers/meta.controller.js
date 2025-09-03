import prisma from '../prisma/client.js';

export async function getStats(_req, res) {
  try {
  // Executa consultas em paralelo para melhor desempenho
    const [jogadores, desafios, tentativasCount, acertosCount, pontosAgg, musicasDistinct] = await Promise.all([
      prisma.usuario.count(),
      prisma.desafio.count(),
      prisma.tentativa.count(),
      prisma.tentativa.count({ where: { acertou: true } }),
      prisma.tentativa.aggregate({ _sum: { pontos: true } }),
      prisma.desafioMusica.findMany({ select: { deezerId: true }, distinct: ['deezerId'] })
    ]);

    const musicas = musicasDistinct.length;
    const mediaAcuracia = tentativasCount ? Number(((acertosCount / tentativasCount) * 100).toFixed(1)) : 0;
    const pontosTotais = pontosAgg._sum.pontos || 0;

    res.json({
      musicas,
      desafios,
      jogadores,
      tentativas: tentativasCount,
      acertos: acertosCount,
      mediaAcuracia,
      pontosTotais
    });
  } catch (e) {
    console.error('getStats error', e);
    res.status(500).json({ error: { code: 'META_STATS_ERRO', message: 'Falha ao carregar estatísticas' } });
  }
}

export default { getStats };
