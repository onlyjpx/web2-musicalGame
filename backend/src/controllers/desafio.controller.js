import prisma from '../prisma/client.js';

export const listarDesafios = async (req, res) => {
    try {
        const desafios = await prisma.desafio.findMany({
            include: { musicas: { include: {musica: true } } },
        });
        res.json(desafios);
    }catch (error) {
        console.error(error);
        res.status(500).json({error: "Erro ao listar desafios"});
    }
}

export const criarDesafio = async (req, res) => {
    try {
        const { titulo, genero, dificuldade } = req.body;

        if (req.usuario.tipo !== "admin") {
            return res.status(403).json({ error: "Acesso negado: apenas administradores podem criar desafios" });
        }

        const desafioExistente = await prisma.desafio.findFirst({ where: { titulo } });
        if (desafioExistente) return res.status(400).json({ error: "Conflito: Já existe um desafio com este título" });

        const novoDesafio = await prisma.desafio.create({
            data: {
                titulo,
                genero,
                dificuldade
            },
        })
        res.status(201).json(novoDesafio);

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
            include: {musicas: { include: {musica: true } } },
        });
        if (!desafio) return res.status(404).json({ error: "Desafio não encontrado" });
        res.json(desafio);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao obter desafios" });
    }
}

export const atualizarDesafio = async (req, res) => {
    const { id } = req.params;
    const { titulo, genero, dificuldade } = req.body;

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
                dificuldade
            }});
        res.json(desafioAtualizado);
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
        res.json({ message: "Desafio deletado com sucesso", desafio: desafioDeletado });
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar desafio" });
    }
}