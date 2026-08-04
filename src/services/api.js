import axios from 'axios';

const envBase = import.meta?.env?.VITE_API_URL;
const baseURL = envBase || '/api';

export const api = axios.create({ baseURL });

// Interceptor para tratar 401 e deslogar opcionalmente (poderíamos injetar depois)
// Mantido simples agora; o AuthProvider injeta Authorization header quando disponível.