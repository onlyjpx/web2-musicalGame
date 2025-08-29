import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BotaoAnimado from '../components/reusable/botaoAnimado';
import { LoginGoogleCustom } from '../components/googleLogin';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Entrar</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Bem-vindo de volta! Acesse sua conta.</p>
        <form
          onSubmit={e => { e.preventDefault(); onSubmit(); }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="senha" className="text-sm font-medium">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              idle: 'bg-blue-600 hover:bg-blue-500 text-white',
              loading: 'bg-blue-600 text-white opacity-80 cursor-wait',
              success: 'bg-green-600 text-white hover:bg-green-500',
              error: 'bg-red-600 text-white hover:bg-red-500'
            }}
            baseClasses="w-full flex items-center justify-center gap-2 rounded-xl font-medium"
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
          <Link to="/registrar" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Registrar</Link>
        </p>
      </div>
    </div>
  );
}