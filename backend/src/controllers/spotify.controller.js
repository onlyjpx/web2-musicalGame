import axios from 'axios';
import { getSpotifyToken } from '../services/spotify.service.js';

export async function buscarMusicas(req, res){
    try{
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: "Query de busca é obrigatória" });
        }

        const token = await getSpotifyToken();
        const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
            {
                headers: { Authorization: `Bearer ${token}`,},
            }
        )

        console.log(JSON.stringify(response.data, null, 2));

        const musicas = (response.data.tracks?.items || []).map((track) => ({
            spotifyId: track.id,
            nome: track.name,
            artista: track.artists.map((a) => a.name).join(", "),
            album: track.album.name,
            urlPreview: track.preview_url,
            imagemUrl: track.album.images?.[0]?.url || null,
            urlSpotify: track.external_urls.spotify,
            duracaoMs: track.duration_ms,
        }));


        res.json(musicas);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar músicas" });
    }
}