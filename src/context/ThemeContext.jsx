import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'theme'; // 'light' | 'dark' | 'system'

const ThemeContext = createContext({
  theme: 'system', // preferência salva
  resolvedTheme: 'light', // tema efetivo após resolver 'system'
  setTheme: () => {},
  toggleTheme: () => {},
});

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');

  // Aplica classe no <html>
  const applyClass = useCallback((value) => {
    const root = document.documentElement;
    if (value === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }, []);

  // Inicialização
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = stored || 'system';
    setTheme(initial);
  }, []);

  // Listener para mudanças do sistema quando em 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const sys = getSystemPreference();
      setResolvedTheme(sys);
      applyClass(sys);
    };
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme, applyClass]);

  // Recalcula quando theme muda
  useEffect(() => {
    if (theme === 'system') {
      const sys = getSystemPreference();
      setResolvedTheme(sys);
      applyClass(sys);
    } else {
      setResolvedTheme(theme);
      applyClass(theme);
    }
    if (theme) localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, applyClass]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const current = prev === 'system' ? getSystemPreference() : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, toggleTheme }), [theme, resolvedTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export { ThemeContext };
