import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import BotaoAnimado from '../components/reusable/botaoAnimado';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/reusable/ThemeToggle';

export default function Registrar() {
    const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });
    const [error, setError] = useState('');
    const [estadoBotao, setEstadoBotao] = useState('idle');
    const navigate = useNavigate();
    const { applyAuth } = useAuth();

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    function validar() {
        if (!form.nome.trim()) return 'Nome é obrigatório';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Email inválido';
        if (form.senha.length < 6) return 'Senha deve ter ao menos 6 caracteres';
        if (form.senha !== form.confirmar) return 'Senhas não conferem';
        return null;
    }

    async function onSubmit() {
        setError('');
        const erro = validar();
        if (erro) {
            setError(erro);
            setEstadoBotao('error');
            setTimeout(() => setEstadoBotao('idle'), 2000);
            return;
        }
        setEstadoBotao('loading');
        try {
            const { data } = await api.post('/auth/registrar', {
                nome: form.nome,
                email: form.email,
                senha: form.senha,
                tipo: 'usuario',
            });
            // Backend retorna { usuario, token }
            if (data?.token) {
                applyAuth(data.token, data.usuario);
                setEstadoBotao('success');
                setTimeout(() => navigate('/'), 800);
            } else {
                throw new Error('Resposta inesperada');
            }
        } catch (e) {
            console.error(e);
            setError(e.response?.data?.error || 'Erro ao registrar usuário');
            setEstadoBotao('error');
            setTimeout(() => setEstadoBotao('idle'), 2500);
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-16 bg-gradient-to-b from-white via-slate-50 to-white dark:from-black dark:via-zinc-950 dark:to-black overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>
            <div className="pointer-events-none select-none absolute inset-0 opacity-[0.12] dark:opacity-[0.22]">
                <div className="absolute -top-32 -right-24 w-80 h-80 bg-gradient-to-br from-indigo-500/60 to-fuchsia-500/60 blur-3xl rounded-full" />
                <div className="absolute bottom-[-6rem] left-[-4rem] w-72 h-72 bg-gradient-to-br from-sky-400/50 to-emerald-400/50 blur-3xl rounded-full" />
            </div>
            <div className="relative w-full max-w-md rounded-2xl p-8 backdrop-blur bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <h1 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">Criar conta</h1>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={e => { e.preventDefault(); onSubmit(); }}
                >
                    <div className="flex flex-col gap-1">
                        <label htmlFor="nome" className="text-sm font-medium">Nome</label>
                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            value={form.nome}
                            onChange={handleChange}
                            className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Seu nome"
                            autoComplete="name"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="confirmar" className="text-sm font-medium">Confirmar senha</label>
                            <input
                                id="confirmar"
                                name="confirmar"
                                type="password"
                                value={form.confirmar}
                                onChange={handleChange}
                                className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Repita a senha"
                                autoComplete="new-password"
                            />
                        </div>

                    {error && (
                        <div className="text-sm text-center font-medium text-red-600 dark:text-red-400" role="alert">{error}</div>
                    )}

                    <BotaoAnimado
                        state={estadoBotao}
                        onStateChange={setEstadoBotao}
                        autoResetMs={null}
                        onClick={onSubmit}
                        mensagens={{
                            idle: 'Registrar',
                            loading: 'Criando...',
                            success: 'Bem-vindo!',
                            error: 'Tentar novamente'
                        }}
                        variantClasses={{
                            idle: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow',
                            loading: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white opacity-80 cursor-wait',
                            success: 'bg-green-600 text-white hover:bg-green-500',
                            error: 'bg-red-600 text-white hover:bg-red-500'
                        }}
                        baseClasses="flex w-full justify-center rounded-xl font-medium p-2 h-11"
                    />
                </form>
                <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                    Já tem conta?{' '}
                    <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Entrar</Link>
                </p>
            </div>
        </div>
    );
}