import { verificarToken } from '../utils/token.js';

export function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error : "Token ausente" });

    const [, token] = authHeader.split(" ");
    try{
        const payload = verificarToken(token);
        req.usuario = payload;
        next();
    }catch(error){
        console.error("Erro ao verificar token:", error);
        return res.status(401).json({ error: "Token inválido" });
    }
}