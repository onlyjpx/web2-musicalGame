import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BotaoAnimado from '../components/reusable/botaoAnimado';
import { LoginGoogleCustom } from '../components/googleLogin';
import ThemeToggle from '../components/reusable/ThemeToggle';

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [estadoBotao, setEstadoBotao] = useState('idle');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function validar() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Email inválido';
    if (!form.senha) return 'Senha obrigatória';
    return null;
  }

  async function onSubmit() {
    setError('');
    const erro = validar();
    if (erro) {
      setError(erro);
      setEstadoBotao('error');
      setTimeout(() => setEstadoBotao('idle'), 1500);
      return;
    }
    setEstadoBotao('loading');
    try {
      await login({ email: form.email, senha: form.senha });
      setEstadoBotao('success');
      setTimeout(() => navigate('/'), 600);
    } catch (e) {
      console.error(e);
      setError('Credenciais inválidas');
      setEstadoBotao('error');
      setTimeout(() => setEstadoBotao('idle'), 2000);
    }
  }

  return (
  <div className="min-h-screen relative flex items-center justify-center px-4 py-16 bg-gradient-to-b from-surface-soft via-white to-surface-soft dark:from-black dark:via-zinc-950 dark:to-black overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {/* decorative blobs */}
      <div className="pointer-events-none select-none absolute inset-0 opacity-[0.12] dark:opacity-[0.22]">
        <div className="absolute -top-32 -left-24 w-80 h-80 bg-gradient-to-br from-indigo-500/60 to-fuchsia-500/60 blur-3xl rounded-full" />
        <div className="absolute bottom-[-6rem] right-[-4rem] w-72 h-72 bg-gradient-to-br from-sky-400/50 to-emerald-400/50 blur-3xl rounded-full" />
      </div>
  <div className="relative w-full max-w-md rounded-2xl p-8 backdrop-blur bg-white/85 dark:bg-zinc-900/70 border border-slate-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">Entrar</h1>
  <p className="text-sm text-slate-600 dark:text-gray-400 mb-6">Bem-vindo de volta! Acesse sua conta.</p>
        <form
          onSubmit={e => { e.preventDefault(); onSubmit(); }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-300">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border border-slate-300 dark:border-gray-700 bg-white/70 dark:bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="senha" className="text-sm font-medium text-slate-900 dark:text-slate-300">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              className="border border-slate-300 dark:border-gray-700 bg-white/70 dark:bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</div>}
          <BotaoAnimado
            state={estadoBotao}
            onStateChange={setEstadoBotao}
            autoResetMs={null}
            onClick={onSubmit}
            mensagens={{
              idle: 'Entrar',
              loading: 'Verificando...',
              success: 'Sucesso',
              error: 'Tentar novamente'
            }}
            variantClasses={{
              idle: 'bg-indigo-600 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 text-slate-800 dark:text-gray-100 hover:bg-indigo-800 hover:text-slate-100 dark:hover:bg-gray-800',
              loading: 'bg-white/70 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 cursor-wait',
              success: 'bg-green-600 text-white hover:bg-green-500',
              error: 'bg-red-600 text-white hover:bg-red-500'
            }}
            baseClasses="w-full flex items-center justify-center gap-2 rounded-xl font-medium h-11"
          />
        </form>
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1" />
            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">ou</span>
            <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1" />
          </div>
          <LoginGoogleCustom />
        </div>
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          Não tem conta?{' '}
          <Link to="/registrar" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Registrar</Link>
        </p>
      </div>
    </div>
  );
}