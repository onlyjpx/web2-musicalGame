import jwt from 'jsonwebtoken';
import process from 'process';

const JWT_SECRET = process.env.JWT_SECRET;

export function gerarToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verificarToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
