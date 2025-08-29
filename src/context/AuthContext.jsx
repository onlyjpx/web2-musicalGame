import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';

// Chave padrão para localStorage
const STORAGE_KEY = 'auth';

// Estrutura inicial
const initialAuthState = {
  user: null, // { id, email, tipo, ... }
  token: null,
  loading: true,
};

const AuthContext = createContext({
  ...initialAuthState,
  login: async () => {},
  logout: () => {},
  setUser: () => {},
  applyAuth: () => {}, // usado para login via Google
});

// Função simples para decodificar JWT (sem validar assinatura)
function decodeJWT(token) {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);
  const axiosInterceptorRef = useRef(null);

  // Carrega do storage ao montar
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const { token: savedToken, user: savedUser } = JSON.parse(raw);
        if (savedToken) {
          setToken(savedToken);
          // Se não houver user salvo, tenta decodificar
          setUser(savedUser || decodeJWT(savedToken));
          api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
        }
      } catch {
        // Ignora erros de parse
      }
    }
    setLoading(false);
  }, []);

  const persist = useCallback((data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem(STORAGE_KEY);
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const scheduleExpiry = useCallback((jwt) => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    const decoded = decodeJWT(jwt);
    if (!decoded || !decoded.exp) return; // sem exp não agenda
    const expMs = decoded.exp * 1000;
    const now = Date.now();
    const delta = expMs - now;
    if (delta <= 0) {
      // já expirado
      logout();
      return;
    }
    // agenda logout 1s após exp para evitar race
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, delta + 1000);
  }, [logout]);

  const applyAuth = useCallback((newToken, usuario) => {
    let safeUser = usuario || decodeJWT(newToken);
    if (safeUser && typeof safeUser === 'object') {
      // Back está retornando a senha, aqui ele exclui qualquer possibilidade antes de salvar no LS
      const clone = { ...safeUser };
      delete clone.senha;
      delete clone.password;
      delete clone.hash;
      safeUser = clone;
    }
    setToken(newToken);
    setUser(safeUser);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    persist({ token: newToken, user: safeUser });
    scheduleExpiry(newToken);
  }, [persist, scheduleExpiry]);

  const login = useCallback(async ({ email, senha }) => {
    const { data } = await api.post('/auth/login', { email, senha });
    const { token: newToken, usuario } = data;
    applyAuth(newToken, usuario);
    return usuario;
  }, [applyAuth]);

  // Instala interceptor 401 uma vez
  useEffect(() => {
    if (axiosInterceptorRef.current != null) return; // já instalado
    const id = api.interceptors.response.use(
      res => res,
      err => {
        const status = err?.response?.status;
        if (status === 401) {
          // se token expirou ou inválido, encerra sessão
          logout();
        }
        return Promise.reject(err);
      }
    );
    axiosInterceptorRef.current = id;
    return () => {
      if (axiosInterceptorRef.current != null) {
        api.interceptors.response.eject(axiosInterceptorRef.current);
        axiosInterceptorRef.current = null;
      }
    };
  }, [logout]);

  // Após carregar do storage, agenda expiração se houver token
  useEffect(() => {
    if (token) scheduleExpiry(token);
  }, [token, scheduleExpiry]);

  const value = useMemo(() => ({ user, token, loading, login, logout, setUser, applyAuth }), [user, token, loading, login, logout, applyAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider, AuthContext };
