import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Interceptor para tratar 401 e deslogar opcionalmente (poderíamos injetar depois)
// Mantido simples agora; o AuthProvider injeta Authorization header quando disponível.
