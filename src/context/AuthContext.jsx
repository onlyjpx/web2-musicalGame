import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
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

  const applyAuth = useCallback((newToken, usuario) => {
    setToken(newToken);
    setUser(usuario || decodeJWT(newToken));
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    persist({ token: newToken, user: usuario });
  }, [persist]);

  const login = useCallback(async ({ email, senha }) => {
    const { data } = await api.post('/auth/login', { email, senha });
    const { token: newToken, usuario } = data;
    applyAuth(newToken, usuario);
    return usuario;
  }, [applyAuth]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ user, token, loading, login, logout, setUser, applyAuth }), [user, token, loading, login, logout, applyAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider, AuthContext };
