import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://web2-musicalgame.onrender.com',
});

// Interceptor para tratar 401 e deslogar opcionalmente (poderíamos injetar depois)
// Mantido simples agora; o AuthProvider injeta Authorization header quando disponível.
