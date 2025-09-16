import { motion as _m } from "motion/react";
import { User, LogIn, UserPlus, LogOut, Shield, Trophy, Zap, Music2, Users, Compass, Sparkles, UserRoundPenIcon, Music2Icon, Music4Icon } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from '../services/api';
import { LoginGoogleCustom } from '../components/googleLogin'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/reusable/ThemeToggle';

export default function Home() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, token, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Dados das seções principais + detalhes
  const features = [
    {
      key: 'desafios',
      titulo: 'Desafios do Dia',
      desc: 'Participe dos desafios diários.',
      detalhe: 'Todo dia novos trechos de músicas são liberados. Você tem tentativas limitadas para adivinhar antes que mais segundos da faixa sejam revelados.'
    },
    {
      key: 'ranking',
      titulo: 'Ranking Global',
      desc: 'Veja quem está no topo.',
      detalhe: 'O ranking soma sua pontuação baseada em acertos rápidos e streaks. Suba de posição jogando diariamente e mantendo uma sequência.'
    },
    {
      key: 'criar',
      titulo: 'Crie seu Desafio',
      desc: 'Monte desafios para seus amigos.',
      detalhe: 'Selecione músicas, defina dicas e compartilhe um link para amigos competirem entre si em tempo real.'
    },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // métricas reais via backend /meta/stats
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsErro, setStatsErro] = useState('');

  useEffect(()=> {
    let cancel = false;
    async function loadStats() {
      setStatsLoading(true); setStatsErro('');
      try {
        const { data } = await api.get('/meta/stats');
        if (!cancel) setStatsData(data);
      } catch {
        if (!cancel) setStatsErro('Falha ao carregar');
      } finally { if (!cancel) setStatsLoading(false); }
    }
    loadStats();
    const interval = setInterval(loadStats, 60000); // atualiza a cada 1 min
    return () => { cancel = true; clearInterval(interval); };
  }, []);

  const formatNum = (n) => {
    if (n == null) return '—';
    if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,'')+'M';
    if (n >= 1_000) return (n/1_000).toFixed(1).replace(/\.0$/,'')+'k';
    return String(n);
  };

  const stats = [
    {
      key:'musicas',
      icon: <Music2 className="w-4 h-4" />, label: 'Músicas Únicas', value: formatNum(statsData?.musicas),
      subtitle: 'No banco de desafios', tooltip: 'Total de faixas distintas associadas a desafios.'
    },
    {
      key:'desafios',
      icon: <Trophy className="w-4 h-4" />, label: 'Desafios Ativos', value: formatNum(statsData?.desafios),
      subtitle: 'Criados pela comunidade', tooltip: 'Quantidade total de desafios cadastrados.'
    },
    {
      key:'jogadores',
      icon: <Users className="w-4 h-4" />, label: 'Jogadores', value: formatNum(statsData?.jogadores),
      subtitle: 'Usuários registrados', tooltip: 'Usuários que possuem conta e/ou tentativas.'
    },
    {
      key:'tentativas',
      icon: <Zap className="w-4 h-4" />, label: 'Tentativas', value: formatNum(statsData?.tentativas),
      subtitle: 'Palpites feitos', tooltip: 'Número de palpites registrados (acertos + erros).' 
    },
    {
      key:'acuracia',
      icon: <Sparkles className="w-4 h-4" />, label: 'Acurácia Média', value: statsData ? (statsData.mediaAcuracia+'%') : '—',
      subtitle: 'Acertos / tentativas', tooltip: 'Percentual médio de sucesso em todas as tentativas.'
    },
    {
      key:'pontos',
      icon: <Music4Icon className="w-4 h-4" />, label: 'Pontos Totais', value: formatNum(statsData?.pontosTotais),
      subtitle: 'Pontuação acumulada', tooltip: 'Soma de todos os pontos gerados por acertos.'
    }
  ];

  const roadmap = [
    { title: 'Modo Coop', text: 'Jogue com amigos tentando somar pontos.' },
    { title: 'Ranking Sazonal', text: 'Temporadas com reset e recompensas.' },
    { title: 'Skins & Badges', text: 'Colecione conquistas por streaks.' },
  ];

  // mini ranking preview
  const [rankingPreview, setRankingPreview] = useState([]);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankErro, setRankErro] = useState('');

  useEffect(()=> {
    let cancel = false;
    async function loadRanking() {
      setRankLoading(true); setRankErro('');
      try {
        const { data } = await api.get('/ranking/global?limit=5');
        if (!cancel) setRankingPreview(data.ranking || []);
  } catch {
        if (!cancel) setRankErro('Falha ao carregar ranking');
      } finally { if (!cancel) setRankLoading(false); }
    }
    loadRanking();
    return () => { cancel = true; };
  }, []);

  return (
  <div className={"relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white dark:from-black dark:via-zinc-950 dark:to-black text-black dark:text-white"}> 
      {/* Background com os blobs */}
      <div className="pointer-events-none select-none absolute inset-0 opacity-[0.15] dark:opacity-[0.25]">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-br from-indigo-500/60 to-fuchsia-500/60 blur-3xl rounded-full" />
        <div className="absolute top-1/2 -right-32 w-72 h-72 bg-gradient-to-br from-sky-400/50 to-emerald-400/50 blur-3xl rounded-full" />
      </div>
      {/* Header */}
  <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music2Icon className="w-5 h-5" />
            <h1 className="font-bold text-xl">Music Guessr</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={()=> navigate('/ranking')}
              className="p-2 rounded-full bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 transition-colors"
              aria-label="Ranking Global"
            >
              <Trophy className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <div className="relative user-menu">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-full bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
              
              {showUserMenu && (
                <_m.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-700 py-2 z-50"
                >
      {token ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
        {user?.nome || user?.email || 'Usuário'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
        {loading ? 'Carregando...' : 'Logado'}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/perfil')}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <UserRoundPenIcon className="w-4 h-4" /> Perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => navigate('/login')}
                      >
                        <LogIn className="w-4 h-4" />
                        Entrar
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => navigate("/registrar")}
                      >
                        <UserPlus className="w-4 h-4" />
                        Registrar
                      </button>
                      <div className="border-t border-slate-200 dark:border-gray-700 m-3 p-2">
                        <LoginGoogleCustom />
                      </div>
                    </>
                  )}
                </_m.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-5 pt-24 pb-24 text-center">
        <_m.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow">
            <Sparkles className="w-3 h-3" /> Nova experiência musical
          </div>
          <h2 className="mt-6 font-extrabold tracking-tight text-4xl sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">Adivinhe a Música em Segundos</h2>
          <p className="mt-6 text-base sm:text-lg max-w-2xl mx-auto text-slate-600 dark:text-gray-400 leading-relaxed">
            Ouça trechos curtos, faça palpites inteligentes e suba no ranking. Cada segundo vale pontos — velocidade e precisão importam.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <_m.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={()=> navigate('/jogar')} className="px-7 py-3 rounded-xl font-semibold shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm">Jogar Agora</_m.button>
            <_m.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={()=> scrollTo('sec-desafios')} className="px-7 py-3 rounded-xl font-semibold shadow-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700 text-sm">Explorar Recursos</_m.button>
          </div>
        </_m.div>
        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {stats.map(s => (
            <div
              key={s.key}
              title={s.tooltip}
              className="group relative rounded-2xl p-4 bg-gradient-to-br from-white/80 to-white/60 dark:from-zinc-900/70 dark:to-zinc-900/40 backdrop-blur border border-zinc-200/70 dark:border-zinc-800/70 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">{s.icon}</span>
                  <span className="truncate max-w-[5rem] sm:max-w-none">{s.label}</span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 text-[9px] px-2 py-0.5 rounded-full bg-indigo-600 text-white transition">info</span>
              </div>
              <div className="mt-3 text-xl font-bold tracking-tight flex items-end gap-1 text-slate-900 dark:text-zinc-100">
                {statsLoading ? <span className="animate-pulse h-5 w-14 rounded bg-gray-200 dark:bg-gray-800" /> : s.value}
              </div>
              <div className="mt-1 text-[10px] font-medium text-slate-500 dark:text-gray-400">{s.subtitle}</div>
              {statsErro && s.key==='musicas' && !statsLoading && <div className="text-[10px] text-red-500 mt-1">{statsErro}</div>}
              <div className="absolute -bottom-6 -right-4 w-20 h-20 bg-gradient-to-tr from-indigo-500/10 via-fuchsia-500/10 to-rose-500/10 rounded-full blur-xl" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-indigo-500/30 transition" />
            </div>
          ))}
        </div>
      </section>

      {/* Cards */}
  <section className="max-w-6xl mx-auto px-5 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((card) => (
          <_m.button
            key={card.key}
            onClick={() => scrollTo(`sec-${card.key}`)}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  className="relative overflow-hidden text-left p-6 rounded-2xl shadow-md bg-slate-100 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer group"
          >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-indigo-600/10 via-fuchsia-600/10 to-rose-600/10" />
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span>{card.titulo}</span>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-600 text-white">ver mais</span>
            </h3>
            <p className="text-slate-600 dark:text-gray-400">{card.desc}</p>
          </_m.button>
        ))}
      </section>

      {/* Seções detalhadas */}
      <section className="max-w-6xl mx-auto px-5 pb-32 flex flex-col gap-24">
        {features.map(card => (
          <div
            key={card.key}
            id={`sec-${card.key}`}
            className="scroll-mt-32"
          >
            <_m.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -80px 0px' }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold mb-3"
            >
              {card.titulo}
            </_m.h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 max-w-3xl">
              {card.detalhe}
            </p>
            <button
              onClick={() => scrollTo('top')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Voltar ao topo ↑
            </button>
          </div>
        ))}
        {/* Roadmap / Próximos */}
        {/* Mini Ranking Preview */}
        <div id="sec-ranking" className="scroll-mt-32">
          <_m.h3 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:.5 }} className="text-2xl font-bold mb-6 flex items-center gap-2">Top Jogadores <Trophy className="w-5 h-5 text-indigo-500" /></_m.h3>
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
            <div className="grid grid-cols-[auto,1fr,auto] gap-3 px-4 py-2 text-[11px] font-medium text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-zinc-800">
              <span>#</span><span>Jogador</span><span>Pontos</span>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-[11px]">
              {rankLoading && Array.from({length:5}).map((_,i)=>(
                <div key={i} className="px-4 py-3 animate-pulse flex items-center gap-3">
                  <div className="w-4 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                  <div className="h-3 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              ))}
              {!rankLoading && rankingPreview.map(r => (
                <button key={r.usuarioId} onClick={()=> navigate('/ranking')} className="w-full text-left px-4 py-2 grid grid-cols-[auto,1fr,auto] gap-3 items-center hover:bg-indigo-50 dark:hover:bg-zinc-800/60 transition">
                  <span className={`font-semibold ${r.posicao <=3 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{r.posicao}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={r.picture} alt="pic" className="w-7 h-7 rounded-full object-cover" />
                    <span className="truncate font-medium text-gray-700 dark:text-gray-200">{r.nome}</span>
                  </div>
                  <span className="font-semibold tabular-nums text-slate-800 dark:text-gray-100">{r.pontos}</span>
                </button>
              ))}
              {!rankLoading && !rankingPreview.length && (
                <div className="px-4 py-4 text-gray-500 dark:text-gray-400">{rankErro || 'Sem dados ainda.'}</div>
              )}
            </div>
            <div className="p-3 flex justify-end">
              <button onClick={()=> navigate('/ranking')} className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Ver ranking completo →</button>
            </div>
          </div>
        </div>
        
        {/* Roadmap / Próximos */}
        <div className="mt-4" id="sec-roadmap">
          <_m.h3 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:.5 }} className="text-2xl font-bold mb-6 flex items-center gap-2">Próximos Passos <Compass className="w-5 h-5 text-indigo-500" /></_m.h3>
          <div className="grid gap-5 md:grid-cols-3">
            {roadmap.map(r => (
              <div key={r.title} className="relative p-5 rounded-xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200 dark:border-zinc-800 shadow-sm">
                <h4 className="font-semibold text-sm mb-2 text-indigo-600 dark:text-indigo-400">{r.title}</h4>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{r.text}</p>
                <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-gradient-to-tr from-indigo-500/10 to-fuchsia-500/10 rounded-full blur-xl" />
              </div>
            ))}
          </div>
        </div>
        {/* CTA Final */}
        <div className="mt-24 relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-[1px] shadow-xl">
          <div className="rounded-3xl bg-white dark:bg-zinc-950 px-8 py-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500">Pronto para entrar no ritmo?</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 max-w-md">Comece um desafio agora e conquiste o topo do ranking antes que alguém pegue seu lugar.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <_m.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=> navigate('/jogar')} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow">Jogar Agora</_m.button>
              <_m.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=> scrollTo('sec-ranking')} className="px-6 py-3 rounded-xl bg-white dark:bg-zinc-800 text-sm font-semibold text-slate-800 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700 shadow">Ver Ranking</_m.button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
  <footer className="border-t border-slate-200 dark:border-gray-800 py-10 text-center text-xs text-slate-500 dark:text-gray-400 mt-10">
    <p className="mb-2">© 2025 Music Guessr • Feito com música e código</p>
    <p>Website em processo de desenvolvimento - Projeto Web II.</p>
      </footer>

      {/* Botão flutuante para admin */}
      {token && user?.tipo === 'admin' && (
        <_m.button
          onClick={() => navigate('/admin')}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl font-medium shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-black"
          aria-label="Área administrativa"
        >
          <Shield className="w-5 h-5" />
          <span className="hidden sm:inline">Admin</span>
        </_m.button>
      )}
    </div>
  );
}
