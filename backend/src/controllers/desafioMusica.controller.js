import prisma from "../prisma/client.js";
import { buscarMusicaDeezer, buscarMusicaDeezerPorId } from "../services/deezer.service.js";
import { LIMITES } from '../utils/validation.js';

function toMusicaDTO(m) {
    return {
        deezerId: m.deezerId,
        titulo: m.titulo,
        artista: m.artista,
        album: m.album,
        imagem: m.imagem,
        preview: m.preview,
        duracao: m.duracao,
        link: m.link,
        addedAt: m.addedAt || m.createdAt || null,
    };
}

export async function adicionarMusicaAoDesafio(req, res) {
    const { id } = req.params;
    const { musicaNome, artistaNome, deezerId } = req.body;

    try {
        if ((!musicaNome || !musicaNome.trim()) && !deezerId) {
            return res.status(400).json({ error: { code: 'MUSICA_IDENTIFICADOR_OBRIGATORIO', message: "Informe o nome da música ou um deezerId" } });
        }

        if(req.usuario.tipo.toLowerCase() !== "admin") {
            return res.status(403).json({ error: "Acesso negado, apenas admins podem adicionar músicas a um desafio" });
        }

        const desafio = await prisma.desafio.findUnique ({
            where: { id: Number(id)},
        })

        if(!desafio) {
            return res.status(404).json({ error: { code: 'DESAFIO_NAO_ENCONTRADO', message: "Desafio não encontrado" } });
        }

        const totalMusicas = await prisma.desafioMusica.count({ where: { desafioId: Number(id) } });
        if (totalMusicas >= LIMITES.MAX_MUSICAS_DESAFIO) {
            return res.status(400).json({ error: { code: 'LIMITE_MUSICAS', message: `Limite de ${LIMITES.MAX_MUSICAS_DESAFIO} músicas por desafio atingido` } });
        }

        let musicaDeezer;
        if (deezerId) {
            musicaDeezer = await buscarMusicaDeezerPorId(deezerId);
        } else {
            musicaDeezer = await buscarMusicaDeezer(musicaNome, artistaNome);
        }
        if (!musicaDeezer) {
            return res.status(404).json({ error: { code: 'MUSICA_NAO_ENCONTRADA_DEEZER', message: "Música não encontrada no Deezer" } });
        }

        const musicaExistente = await prisma.desafioMusica.findUnique({
            where: {
                desafioId_deezerId: {
                    desafioId: Number(id),
                    deezerId : String(musicaDeezer.deezerId),
                },
            },
        });

        if(musicaExistente) {
            return res.status(400).json({ error: { code: 'MUSICA_DUPLICADA', message: "Música já associada a este desafio" } });
        }

        await prisma.desafioMusica.create({
            data: {
                desafioId: Number(id),
                deezerId: String(musicaDeezer.deezerId),
            }
        });

        const desafioAtualizado = await prisma.desafio.findUnique({
            where: { id: Number(id) },
            include: { _count: { select: { musicas: true } } }
        });

        const registros = await prisma.desafioMusica.findMany({ where: { desafioId: Number(id) } });
        const musicasDetalhadas = await Promise.all(registros.map(async (musica) => {
            const musicaDeezer2 = await buscarMusicaDeezerPorId(musica.deezerId);
            if(!musicaDeezer2) return null;
            return { ...musicaDeezer2, addedAt: musica.createdAt };
        }));
    return res.status(201).json({ musicas: musicasDetalhadas.filter(Boolean).map(toMusicaDTO), musicasCount: desafioAtualizado._count.musicas });
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao adicionar música ao desafio" });
    }
}

export const listarMusicasDoDesafio = async (req, res) => {
    const { id } = req.params;

    try{
    const registros = await prisma.desafioMusica.findMany({ where: { desafioId: Number(id) } });
        const musicas = await Promise.all(registros.map(async (musica) => {
            const musicaDeezer = await buscarMusicaDeezerPorId(musica.deezerId);
            if(!musicaDeezer) return null;
            return { ...musicaDeezer, addedAt: musica.createdAt };
        }));
        return res.status(200).json(musicas.filter(Boolean).map(toMusicaDTO));
        
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar músicas do desafio" });
    }
}

export const deletarMusicaDoDesafio = async (req, res) => {
    const { id } = req.params;
    const { deezerId, musicaNome, artistaNome } = req.body;

    try {
        let targetDeezerId = deezerId;
        if (!targetDeezerId) {
            if (!musicaNome) {
                return res.status(400).json({ error: 'Informe deezerId ou musicaNome para deletar' });
            }
            const musicaBusca = await buscarMusicaDeezer(musicaNome, artistaNome);
            if (!musicaBusca) return res.status(404).json({ error: 'Música não encontrada' });
            targetDeezerId = musicaBusca.deezerId;
        }

        const musicaExistente = await prisma.desafioMusica.findUnique({
            where: { desafioId_deezerId: { desafioId: Number(id), deezerId: String(targetDeezerId) } }
        });
        if (!musicaExistente) {
            return res.status(404).json({ error: 'Música não associada a este desafio' });
        }

        await prisma.desafioMusica.delete({
            where: { desafioId_deezerId: { desafioId: Number(id), deezerId: String(targetDeezerId) } }
        });

        const desafioAtualizado = await prisma.desafio.findUnique({
            where: { id: Number(id) },
            include: { _count: { select: { musicas: true } } }
        });
        const registros = await prisma.desafioMusica.findMany({ where: { desafioId: Number(id) } });
        const musicasDetalhadas = await Promise.all(registros.map(async (musica) => {
            const musicaDeezer = await buscarMusicaDeezerPorId(musica.deezerId);
            if(!musicaDeezer) return null;
            return { ...musicaDeezer, addedAt: musica.createdAt };
        }));
        return res.status(200).json({ ok: true, musicasCount: desafioAtualizado._count.musicas, musicas: musicasDetalhadas.filter(Boolean).map(toMusicaDTO) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao deletar música do desafio' });
    }
};