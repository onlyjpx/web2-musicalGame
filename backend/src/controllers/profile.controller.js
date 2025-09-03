import prisma from '../prisma/client.js';

export async function getProfile(req, res) {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ error: { code: 'NAO_AUTENTICADO', message: 'Não autenticado' } });

    const usuario = await prisma.usuario.findUnique({ where: { id: userId }, select: { id: true, nome: true, email: true, tipo: true, picture: true, provider: true } });
    if (!usuario) return res.status(404).json({ error: { code: 'USUARIO_NAO_ENCONTRADO', message: 'Usuário não encontrado' } });

  // Cada linha agora representa uma tentativa (palpite) de desafios finalizados
    const agregados = await prisma.tentativa.findMany({
      where: { usuarioId: userId },
      select: { id: true, pontos: true, acertou: true, tempoResposta: true, desafioId: true }
    });
    const totalTentativas = agregados.length;
    const somaPontos = agregados.reduce((a,b)=> a + (b.pontos||0), 0);
    const acertosAgg = agregados.reduce((a,b)=> a + (b.acertou ? 1 : 0), 0);
    const tempos = agregados.filter(t=> typeof t.tempoResposta === 'number').map(t=> t.tempoResposta);
    const mediaTempo = tempos.length ? +(tempos.reduce((a,b)=> a+b,0) / tempos.length).toFixed(2) : null;

  // Agrupa por dificuldade via desafios relacionados
    const desafiosIds = [...new Set(agregados.map(a=> a.desafioId))];
    const desafios = desafiosIds.length ? await prisma.desafio.findMany({ where: { id: { in: desafiosIds } }, select: { id: true, dificuldade: true } }) : [];
    const diffMap = new Map(desafios.map(d=> [d.id, d.dificuldade]));
    const diffStats = {};
    agregados.forEach(t => {
      const diff = diffMap.get(t.desafioId) || 'FACIL';
      if (!diffStats[diff]) diffStats[diff] = { tentativas: 0, pontos: 0 };
      diffStats[diff].tentativas += 1;
      diffStats[diff].pontos += t.pontos || 0;
    });

    const recentes = await prisma.tentativa.findMany({
      where: { usuarioId: userId },
      orderBy: { id: 'desc' },
      take: 20,
      select: { id: true, acertou: true, tempoResposta: true, pontos: true, desafio: { select: { id: true, titulo: true, dificuldade: true } } }
    });

    res.json({
      usuario,
      stats: {
        totalTentativas,
        acertos: acertosAgg,
        taxaAcerto: totalTentativas ? Number(((acertosAgg / totalTentativas) * 100).toFixed(1)) : 0,
        pontosTotais: somaPontos,
        mediaTempoResposta: mediaTempo,
        porDificuldade: diffStats,
      },
      recentes,
    });
  } catch (e) {
    console.error('profile error', e);
    res.status(500).json({ error: { code: 'PROFILE_ERRO', message: 'Erro ao carregar perfil' } });
  }
}

export async function updatePicture(req, res) {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ error: { code: 'NAO_AUTENTICADO', message: 'Não autenticado' } });
    const { picture } = req.body || {};
    if (typeof picture !== 'string' || !picture.trim()) {
      return res.status(400).json({ error: { code: 'PICTURE_OBRIGATORIA', message: 'Imagem obrigatória' } });
    }
    const url = picture.trim();
    if (url.length > 500) {
      return res.status(400).json({ error: { code: 'IMAGEM_MUITO_LONGA', message: 'Endereço muito longo' } });
    }
    // Validação permissiva: aceita http/https, data:image, blob:, ipfs://, ou caminhos relativos (/... ou ./...)
    const permitido = /^(https?:\/\/|data:image\/|blob:|ipfs:\/\/|\/|\.\/|..\/)/i.test(url);
    if (!permitido) {
      return res.status(400).json({ error: { code: 'FORMATO_NAO_SUPORTADO', message: 'Formato de endereço de imagem não suportado' } });
    }
    // Atualiza
    const usuario = await prisma.usuario.update({ where: { id: userId }, data: { picture: url }, select: { id: true, nome: true, email: true, tipo: true, picture: true, provider: true } });
    res.json({ usuario, message: 'Imagem atualizada' });
  } catch (e) {
    console.error('updatePicture error', e);
    res.status(500).json({ error: { code: 'PICTURE_UPDATE_ERRO', message: 'Erro ao atualizar imagem' } });
  }
}

export default { getProfile, updatePicture };