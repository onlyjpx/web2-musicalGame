import axios from 'axios';

export const LIMITES = {
  MAX_TITULO: 100,
  MAX_GENERO: 50,
  MAX_MUSICAS_DESAFIO: 50,
};

// Limita tamanho genérico de string; remove caracteres de controle
export function limitarTamanho(v, max = 255) {
  if (typeof v !== 'string') return '';
  // Remove caracteres de controle ASCII (0-31 exceto \n, \r, \t) via filtragem manual para evitar regex com escapes de controle
  let s = '';
  for (let i = 0; i < v.length; i++) {
    const code = v.charCodeAt(i);
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) continue;
    s += v[i];
  }
  s = s.trim();
  if (s.length > max) s = s.slice(0, max);
  return s;
}

// Sanitiza entradas de busca simples (apenas letras, números, espaços e poucos símbolos seguros)
export function sanitizeBuscaSimples(v, max = 80) {
  if (typeof v !== 'string') return '';
  let s = v.normalize('NFD').replace(/[^\p{L}\p{N}\s'\-_.]/gu, '').replace(/\s+/g, ' ').trim();
  if (s.length > max) s = s.slice(0, max);
  return s;
}

// Verifica se é inteiro positivo (retorna número ou null)
export function parsePositiveInt(v, fallback = null) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) return fallback;
  return n;
}

export function sanitizeTexto(v, max) {
  if (typeof v !== 'string') return '';
  const trimmed = v.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function normalizarDificuldade(v) {
  if (!v) return 'FACIL';
  const up = String(v).trim().toUpperCase();
  const allowed = ['FACIL','MEDIO','DIFICIL','MUITO_DIFICIL','EXTREMO'];
  return allowed.includes(up) ? up : 'FACIL';
}

export function validarUrlCapa(url) {
  if (!url) return null;
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  // tamanho máximo arbitrário
  if (trimmed.length > 500) return null;
  return trimmed;
}

export async function verificarReachable(url) {
  try {
    await axios.head(url, { timeout: 2000, maxRedirects: 3, validateStatus: s => s < 500 });
    return true;
  } catch {
    return false;
  }
}

export function erro(code, message, status = 400) {
  const e = new Error(message);
  e.status = status;
  e.code = code;
  return e;
}
