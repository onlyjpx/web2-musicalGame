import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "jwtsecondsecretkey";

export function gerarToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verificarToken(token) {
    return jwt.verify(token, JWT_SECRET);
}