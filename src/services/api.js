import axios from 'axios';

// Base URL dinâmica: usa env (Vite) ou o hostname atual com porta 3000.
const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const fallback = (host === 'localhost' || host === '127.0.0.1')
  ? 'http://localhost:3000'
  : `http://${host}:3000`;
const baseURL = import.meta?.env?.VITE_API_URL || fallback;

export const api = axios.create({ baseURL });

// Interceptor para tratar 401 e deslogar opcionalmente (poderíamos injetar depois)
// o AuthProvider injeta Authorization header quando disponível.
