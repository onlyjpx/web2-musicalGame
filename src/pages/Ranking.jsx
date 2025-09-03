import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { motion as _m, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft } from 'lucide-react'
import Home from './Home';

const PERIODOS = [
  { key: 'all', label: 'Geral' },
  { key: 'dia', label: 'Hoje' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
];

const DIFS = ['FACIL','MEDIO','DIFICIL','MUITO_DIFICIL','EXTREMO'];

export default function Ranking() {
  const [periodo, setPeriodo] = useState('all');
  const [dif, setDif] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { user } = useAuth();
  // animações são controladas via AnimatePresence; chave dedicada removida
  const navigate = useNavigate();

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true); setErro('');
      try {
        const params = new URLSearchParams({ periodo });
        if (dif) params.set('dificuldade', dif);
  const { data } = await api.get(`/ranking/global?${params.toString()}`);
  if (!cancel) { setData(data); }
      } catch (e) {
        if (!cancel) setErro(e?.response?.data?.error?.message || 'Falha ao carregar ranking');
      } finally { if (!cancel) setLoading(false); }
    }
    load();
    return () => { cancel = true; };
  }, [periodo, dif]);

  return (
    <div className="relative min-h-screen px-5 py-24 flex flex-col items-center gap-10 bg-gradient-to-b from-white via-slate-50 to-white dark:from-black dark:via-zinc-950 dark:to-black overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-sky-400/25 to-emerald-400/25 blur-3xl rounded-full" />
      </div>
      <header className="relative z-10 flex flex-col items-center text-center gap-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">Ranking Global</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Veja os melhores jogadores por período e dificuldade.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex gap-1 bg-white/70 dark:bg-zinc-900/60 backdrop-blur rounded-xl p-1 border border-zinc-200 dark:border-zinc-800 text-[11px]">
            {PERIODOS.map(p => (
              <button key={p.key} onClick={()=> setPeriodo(p.key)} className={`px-3 py-1 rounded-lg font-medium transition ${periodo===p.key ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>{p.label}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-white/70 dark:bg-zinc-900/60 backdrop-blur rounded-xl p-1 border border-zinc-200 dark:border-zinc-800 text-[11px]">
            <button onClick={()=> setDif('')} className={`px-3 py-1 rounded-lg font-medium ${!dif ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>Todas</button>
            {DIFS.map(d => (
              <button key={d} onClick={()=> setDif(d)} className={`px-3 py-1 rounded-lg font-medium ${dif===d ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>{d.replace('_',' ')}</button>
            ))}
          </div>
        </div>
      </header>
  <main className="relative z-10 w-full max-w-6xl flex flex-col gap-6">
        {erro && <div className="text-xs text-red-600 dark:text-red-400">{erro}</div>}
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            <div className="sticky top-0 grid px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 border-b border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm" style={{gridTemplateColumns:'60px 1fr 90px 80px 85px 85px 95px'}}>
              <span className="text-left">Posição</span>
              <span className="text-left">Jogador</span>
              <span className="text-right">Pontos</span>
              <span className="text-right">Acertos</span>
              <span className="text-right">Acurácia</span>
              <span className="text-right">Média (s)</span>
              <span className="text-right">Pts/Tent</span>
            </div>
            <div>
            {loading && Array.from({length:10}).map((_,i)=>(
              <div key={i} className="grid px-5 py-3 items-center animate-pulse text-[11px]" style={{gridTemplateColumns:'60px 1fr 90px 80px 85px 85px 95px'}}>
                <span className="h-3 w-5 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
                {Array.from({length:5}).map((__,j)=>(<span key={j} className="h-3 w-14 ml-auto bg-gray-200 dark:bg-gray-800 rounded" />))}
              </div>
            ))}
            <AnimatePresence mode="popLayout">
              {!loading && data?.ranking?.map(r => {
                const medal = r.posicao===1 ? '🥇' : r.posicao===2 ? '🥈' : r.posicao===3 ? '🥉' : '';
                const highlight = user && r.usuarioId === user.id;
                const accColor = r.acuracia >= 70 ? 'text-emerald-600 dark:text-emerald-400' : r.acuracia >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
                return (
                  <_m.div
                    key={r.usuarioId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`grid px-5 py-3 items-center text-[11px] transition ${highlight ? 'bg-indigo-500/15 dark:bg-indigo-500/25 ring-1 ring-indigo-400/40 shadow-sm' : 'odd:bg-white/60 even:bg-white/30 dark:odd:bg-zinc-900/50 dark:even:bg-zinc-900/30 hover:bg-indigo-50/70 dark:hover:bg-zinc-800/60'}`}
                    style={{gridTemplateColumns:'60px 1fr 90px 80px 85px 85px 95px'}}
                  >
                    <span className={`font-semibold flex items-center gap-1 tabular-nums ${r.posicao <=3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{r.posicao}{medal && <span>{medal}</span>}</span>
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={r.picture} alt="pic" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/40 dark:ring-white/10" />
                      <span className="truncate text-gray-700 dark:text-gray-200 font-medium">{r.nome}</span>
                    </div>
                    <span className="font-semibold text-right pr-1 text-gray-800 dark:text-gray-100 tabular-nums font-mono">{r.pontos}</span>
                    <span className="text-right pr-1 text-gray-600 dark:text-gray-400 tabular-nums font-mono">{r.acertos}</span>
                    <span className={`text-right pr-1 tabular-nums font-mono ${accColor}`}>{r.acuracia}%</span>
                    <span className="text-right pr-1 text-gray-600 dark:text-gray-400 tabular-nums font-mono">{r.mediaTempo ?? '—'}</span>
                    <span className="text-right pr-1 text-gray-600 dark:text-gray-400 tabular-nums font-mono">{r.pontosPorTentativa}</span>
                  </_m.div>
                );
              })}
              {!loading && data?.ranking?.length === 0 && (
                <_m.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="px-4 py-6 text-[11px] text-center text-gray-500 dark:text-gray-400">Sem dados para este filtro.</_m.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <button onClick={()=> navigate('/')} className="p-2 border border-indigo-700 hover:border-indigo-950 hover:bg-gray-800 font-bold rounded-2xl text-indigo-600 hover:text-white dark:text-indigo-400">
        Voltar
      </button>
    </div>
  );
}
