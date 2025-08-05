import axios from "axios";

export const buscarMusicasDeezer = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Parâmetro query é obrigatório" });
    }

    const response = await axios.get("https://api.deezer.com/search", {
      params: { q: query },
    });

    const musicas = response.data.data.map(track => ({
      id: track.id,
      titulo: track.title,
      artista: track.artist.name,
      album: track.album.title,
      imagem: track.album.cover,
      preview: track.preview,
      duracao: track.duration,
      link: track.link 
    }));

    return res.json(musicas);
  } catch (error) {
    console.error("Erro ao buscar no Deezer:", error.message);
    return res.status(500).json({ error: "Erro ao buscar músicas no Deezer" });
  }
};
