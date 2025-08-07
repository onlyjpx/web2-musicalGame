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

    return {
        deezerId: response.data.id,
        titulo: response.data.title,
        artista: response.data.artist.name,
        album: response.data.album.title,
        imagem: response.data.album.cover,
        preview: response.data.preview,
        duracao: response.data.duration,
        link: response.data.link,
    }
}