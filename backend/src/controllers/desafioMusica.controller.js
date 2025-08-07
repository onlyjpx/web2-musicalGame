import prisma from "../prisma/client.js";
import { buscarMusicaDeezer, buscarMusicaDeezerPorId } from "../services/deezer.service.js";

export async function adicionarMusicaAoDesafio(req, res) {
    const { id } = req.params;
    const { musicaNome, artistaNome } = req.body;

    try {
        if (!musicaNome) {
            return res.status(400).json({ error: "O nome da música é obrigatório" });
        }

        if(req.usuario.tipo.toLowerCase() !== "admin") {
            return res.status(403).json({ error: "Acesso negado, apenas admins podem adicionar músicas a um desafio" });
        }

        const desafio = await prisma.desafio.findUnique ({
            where: { id: Number(id)},
        })

        if(!desafio) {
            return res.status(404).json({ error: "Desafio não encontrado" });
        }

        const musicaDeezer = await buscarMusicaDeezer(musicaNome, artistaNome);
        if (!musicaDeezer) {
            return res.status(404).json({ error: "Música não encontrada no Deezer" });
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
            return res.status(400).json({ error: "Música já associada a este desafio" });
        }

        const novaMusica = await prisma.desafioMusica.create({
            data: {
                desafioId: Number(id),
                deezerId: String(musicaDeezer.deezerId),
            }
        })

        return res.status(201).json(novaMusica);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao adicionar música ao desafio" });
    }
}

export const listarMusicasDoDesafio = async (req, res) => {
    const { id } = req.params;

    try{
        const desafio = await prisma.desafioMusica.findMany({
            where: ({ desafioId: Number(id) })
        });

        if(!desafio) {
            return res.status(404).json({ error: "Desafio não encontrado" });
        }

        const musicas = await Promise.all(desafio.map(async (musica) => {
            const musicaDeezer = await buscarMusicaDeezerPorId(musica.deezerId);

            if(!musicaDeezer) {
                return null;
            }

            return {
                deezerId: musicaDeezer.deezerId,
                titulo: musicaDeezer.titulo,
                artista: musicaDeezer.artista,
                album: musicaDeezer.album,
                imagem: musicaDeezer.imagem,
                preview: musicaDeezer.preview,
                duracao: musicaDeezer.duracao,
                link: musicaDeezer.link,
            }
        }));

        const musicasFiltradas = musicas.filter(musica => musica !== null);

        return res.status(200).json(musicasFiltradas);
        
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar músicas do desafio" });
    }
}

export const deletarMusicaDoDesafio = async (req, res) => {
    const { id } = req.params;
    const { musicaNome, artistaNome } = req.body;

    try{
        const musicaId = await buscarMusicaDeezer(musicaNome, artistaNome);
        console.log(musicaId);
        const desafio = await prisma.desafioMusica.findMany({
            where: {
                desafioId: Number(id),
            }
        });

        if(!desafio) {
            return res.status(404).json({ error: "Desafio não encontrado" });
        }

        const musicaExistente = await prisma.desafioMusica.findUnique({
            where:{
                desafioId_deezerId: {
                    desafioId: Number(id),
                    deezerId: String(musicaId.deezerId)
                }
            }
        });

        console.log("Musica encontrada no banco:", musicaExistente);

        if(!musicaExistente) {
            return res.status(404).json({ error: "Música não encontrada ou já deletada"});
        }

        console.log("Tentando deletar:", {
            desafioId: Number(id),
            deezerId: String(musicaExistente.deezerId)
          });
          

        const musicaDeletada = await prisma.desafioMusica.delete({
            where: {
                desafioId_deezerId: {
                    desafioId: Number(id),
                    deezerId: String(musicaId.deezerId)
                }
            }
        })

        res.status(200).json({ message: "Música deletada", musicaDeletada: musicaDeletada });

    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar música do desafio" });
    }
}