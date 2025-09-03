import { buscarMusicasDeezerLista } from "../services/deezer.service.js";

// GET /deezer/search?nome=Imagine&artista=John -- ex de como vai pra busca
export async function searchDeezer(req, res) {
	const { nome, artista } = req.query;
	if (!nome || !nome.trim()) {
		return res.status(400).json({ error: { code: 'PARAM_NOME_OBRIGATORIO', message: 'Parâmetro nome é obrigatório' } });
	}
	try {
		const lista = await buscarMusicasDeezerLista(nome, artista);
		return res.json(lista);
	} catch (e) {
		console.error('Erro busca Deezer:', e.message);
		return res.status(500).json({ error: { code: 'ERRO_DEEZER_SEARCH', message: 'Falha ao consultar Deezer' } });
	}
}

export default { searchDeezer };
