import prisma from '../prisma/client.js';
import { sanitizeTexto, normalizarDificuldade, validarUrlCapa, verificarReachable, LIMITES } from '../utils/validation.js';

function toDesafioDTO(d) {
    return {
        id: d.id,
        titulo: d.titulo,
        genero: d.genero,
        dificuldade: d.dificuldade,
        desafioCapa: d.desafioCapa,
        musicasCount: d._count?.musicas ?? d.musicas?.length ?? 0,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
    };
}

export const listarDesafios = async (req, res) => {
    try {
        // 'DesafioMusica' não possui relação 'musica'; dai removemos include inválido
        const desafios = await prisma.desafio.findMany({
            include: { _count: { select: { musicas: true } } },
            orderBy: { id: 'desc' }
        });
        res.json(desafios.map(toDesafioDTO));
    } catch (error) {
        console.error('listarDesafios error:', error);
        res.status(500).json({ error: 'Erro ao listar desafios' });
    }
}

export const criarDesafio = async (req, res) => {
    try {
        let { titulo, genero, dificuldade, desafioCapa, capa } = req.body;
        if (!desafioCapa && capa) desafioCapa = capa;
        titulo = sanitizeTexto(titulo, LIMITES.MAX_TITULO);
        genero = sanitizeTexto(genero, LIMITES.MAX_GENERO);
        dificuldade = normalizarDificuldade(dificuldade);
        if (!titulo) return res.status(400).json({ error: { code: 'TITULO_OBRIGATORIO', message: 'Título é obrigatório' } });
        if (!genero) return res.status(400).json({ error: { code: 'GENERO_OBRIGATORIO', message: 'Gênero é obrigatório' } });

        if (desafioCapa) {
            const valid = validarUrlCapa(desafioCapa);
            if (!valid) {
                desafioCapa = null; // limpa se inválida
            } else {
                const reachable = await verificarReachable(valid);
                if (!reachable) desafioCapa = null; // isso daqui vai silenciar o erro, é opcional
            }
        }

        if (req.usuario.tipo !== "admin") {
            return res.status(403).json({ error: "Acesso negado: apenas administradores podem criar desafios" });
        }

    const desafioExistente = await prisma.desafio.findFirst({ where: { titulo } });
    if (desafioExistente) return res.status(400).json({ error: { code: 'DUPLICATE_TITULO', message: 'Já existe um desafio com este título' } });

        const novoDesafio = await prisma.desafio.create({
            data: {
                titulo,
                genero,
                dificuldade,
                desafioCapa: desafioCapa || null,
            },
            include: { _count: { select: { musicas: true } } }
        })
        res.status(201).json(toDesafioDTO(novoDesafio));

    }catch (error) {
        console.error(error);
        res.status(500).json({error: "Erro ao criar desafio"});
    }
}

export const obterDesafios = async (req, res) => {
    const { id } = req.params;
    try {
        const desafio = await prisma.desafio.findUnique({
            where: { id: Number(id) },
            include: { _count: { select: { musicas: true } } },
        });
        if (!desafio) return res.status(404).json({ error: "Desafio não encontrado" });
    res.json(toDesafioDTO(desafio));
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao obter desafios" });
    }
}

export const atualizarDesafio = async (req, res) => {
    const { id } = req.params;
    let { titulo, genero, dificuldade, desafioCapa, capa } = req.body;
    if (!desafioCapa && capa) desafioCapa = capa;
    titulo = sanitizeTexto(titulo, LIMITES.MAX_TITULO);
    genero = sanitizeTexto(genero, LIMITES.MAX_GENERO);
    dificuldade = normalizarDificuldade(dificuldade);
    if (desafioCapa) {
        const valid = validarUrlCapa(desafioCapa);
        desafioCapa = valid || null;
        if (valid) {
            const reachable = await verificarReachable(valid);
            if (!reachable) desafioCapa = null;
        }
    }

    if (req.usuario.tipo !== "admin") {
        return res.status(403).json({error: "Acesso negado: apenas administradores podem atualizar desafios"});
    }

    try {
        const desafioExistente = await prisma.desafio.findUnique({ where: { id: Number(id) }});
        if (!desafioExistente) return res.status(404).json({ error: "Desafio não encontrado" });

        const desafioAtualizado = await prisma.desafio.update({
            where: { id: Number(id)},
            data: {
                titulo,
                genero,
                dificuldade,
                desafioCapa: typeof desafioCapa === 'string' && desafioCapa.length ? desafioCapa : null,
            },
            include: { _count: { select: { musicas: true } } }
        });
        res.json(toDesafioDTO(desafioAtualizado));
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar desafio"})
    }
}

export const deletarDesafio = async (req, res) => {
    const { id } = req.params;
    if (req.usuario.tipo !== "admin") {
        return res.status(403).json({ error: "Acesso negado: apenas administradores podem deletar desafios" });
    }
    try{
        const desafioExistente = await prisma.desafio.findUnique({ where: { id: Number(id) } });
        if (!desafioExistente) return res.status(404).json({ error: "Desafio não encontrado" });

        const desafioDeletado = await prisma.desafio.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Desafio deletado com sucesso", desafio: desafioDeletado });
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar desafio" });
    }
}