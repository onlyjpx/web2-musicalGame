import axios from 'axios';

export const buscarMusicaDeezer = async (musicaNome, artistaNome) => {
    const response = await axios.get("https://api.deezer.com/search", {
        params: {q: musicaNome},
    });

    if (!response.data.data || response.data.data.length === 0) {
        return null;
    }

    const nomeNormalizado = musicaNome.trim().toLowerCase();
    const artistaNormalizado = artistaNome ? artistaNome.trim().toLowerCase() : null;

    const trackExata = response.data.data.find(
        track => track.title.trim().toLowerCase() === nomeNormalizado
        && (!artistaNormalizado || track.artist.name.trim().toLowerCase() === artistaNormalizado)
    )

    const musica = trackExata || response.data.data[0];

    return {
        deezerId: musica.id,
    };
}

export const buscarMusicaDeezerPorId = async (deezerId) => {
    const response = await axios.get(`https://api.deezer.com/track/${deezerId}`);

    if (!response.data) {
        return null;
    }

    const alb = response.data.album || {};
    return {
        deezerId: response.data.id,
        titulo: response.data.title,
        artista: response.data.artist.name,
        album: alb.title,
    // Usa a maior capa disponível (xl -> big -> medium -> normal -> small)
        imagem: alb.cover_xl || alb.cover_big || alb.cover_medium || alb.cover || alb.cover_small || null,
        preview: response.data.preview,
        duracao: response.data.duration,
        link: response.data.link,
    }
}

export const buscarMusicasDeezerLista = async (musicaNome, artistaNome) => {
    const response = await axios.get('https://api.deezer.com/search', { params: { q: musicaNome } });
    if (!response.data?.data) return [];
    const termoArtista = artistaNome?.trim().toLowerCase();
    const base = response.data.data.map((t, idx) => {
        const alb = t.album || {};
        return {
            deezerId: t.id,
            titulo: t.title,
            artista: t.artist?.name,
            album: alb.title,
            imagem: alb.cover_xl || alb.cover_big || alb.cover_medium || alb.cover || alb.cover_small || null,
            preview: t.preview,
            duracao: t.duration,
            link: t.link,
            rank: t.rank, // Popularidade no Deezer (0..100000)
            position: idx,
            _matchScore: 0
        }
    });
    // ranking simples
    const nomeLower = musicaNome.trim().toLowerCase();
    base.forEach(item => {
        let score = 0;
        const titleLower = item.titulo?.toLowerCase() || '';
    if (titleLower === nomeLower) score += 60; // Correspondência exata forte
    else if (titleLower.startsWith(nomeLower)) score += 40; // Começa com
    else if (titleLower.includes(nomeLower)) score += 25; // Contém
        if (termoArtista) {
            const artLower = (item.artista||'').toLowerCase();
            if (artLower === termoArtista) score += 35; // Artista exato
            else if (artLower.includes(termoArtista)) score += 15; // Artista parcialmente contido
        }
        // proximidade de tamanho
    score += Math.max(0, 12 - Math.abs((item.titulo||'').length - nomeLower.length)); // Penaliza diferença grande no tamanho
    // Popularidade Deezer normalizada (rank 0..100000) - maior rank = mais popular
        const pop = (item.rank || 0) / 100000; // 0..1
    score += pop * 50; // Peso forte para trazer as mais populares ao topo
    // Leve bônus para as primeiras posições originais (já ordenadas pelo Deezer)
    score += Math.max(0, 8 - item.position); // Top 8 originais ganham bônus decrescente
        item._matchScore = score;
    });
    return base.sort((a,b)=> b._matchScore - a._matchScore).slice(0,15);
};