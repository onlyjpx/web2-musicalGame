import { verificarToken } from "../utils/token.js";

export const autenticar = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  const [tipo, token] = authHeader.split(" ");
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Token mal formatado" });
  }

  try {
    const payload = verificarToken(token);
    req.usuario = payload; 
    console.log("Usuário autenticado:", req.usuario);
    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(401).json({ erro: "Token inválido" });
  }
}
