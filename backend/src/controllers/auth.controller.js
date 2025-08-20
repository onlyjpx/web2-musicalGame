import bcrypt from 'bcrypt'
import prisma from '../prisma/client.js'
import { gerarToken } from '../utils/token.js'
import { verificaGoogleToken } from '../utils/googleAuth.js'

export const registrar = async (req, res) => {
    try{
        const {nome, email, senha, tipo} = req.body;
        const usuarioExistente = await prisma.usuario.findUnique({where : { email}});
        if (usuarioExistente) return res.status(400).json({ error: "Usuário já existe" });

        const senhaHash = await bcrypt.hash(senha, 10);
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                tipo: tipo
            },
        });

        const token = gerarToken({ id: novoUsuario.id, email: novoUsuario.email, tipo: novoUsuario.tipo });
        res.status(201).json({ usuario: novoUsuario, token });

    }   catch(error){
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}

export const login = async (req, res) => {
    try{
        const { email, senha } = req.body;
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ error: "Senha incorreta" });

        const token = gerarToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });
        res.status(200).json({ usuario, token });
    }catch(error){
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { code } = req.body;
        if(!code) return res.status(400).json({ error: "Token não enviado "});

        const googleUser = await verificaGoogleToken(code);
        if(!googleUser) return res.status(401).json({ error: "Email google não verificado "});

        let usuario = await prisma.usuario.findUnique({
            where:{
                email: googleUser.email,
            }
        });

        if(!usuario) {
            usuario = await prisma.usuario.create({
                data:{
                    nome: googleUser.nome,
                    email: googleUser.email,
                    senha: null,
                    provider: "google",
                    picture: googleUser.picture,
                    tipo: "usuario",
                }
            })
        }

        const tokenJWT = gerarToken({ id: googleUser.id, nome: googleUser.nome, tipo: "usuario"});

        res.json( { token: tokenJWT, usuario });

    }catch(error){
        console.error("Algo deu errado: ", error);
        res.status(401).json({ error: "Login com o Google falhou" });
    }
}