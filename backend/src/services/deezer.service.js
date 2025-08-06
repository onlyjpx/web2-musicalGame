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
        titulo: musica.title,
        artista: musica.artist.name,
        album: musica.album.title,
        imagem: musica.album.cover,
        preview: musica.preview,
        duracao: musica.duration,
        link: musica.link,
    };
}