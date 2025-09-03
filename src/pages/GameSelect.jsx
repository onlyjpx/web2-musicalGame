import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesafios } from '../hooks/useDesafios';
import { motion as _m, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowUpFromDot } from 'lucide-react';

export default function GameSelect() {
  const { desafios, carregar, loading, erro } = useDesafios();
  const navigate = useNavigate();
  const [generoFiltro, setGeneroFiltro] = useState('');
  const [busca, setBusca] = useState('');

  // seleção de "featured" (top 3 por maior número de músicas, fallback recentes)
  const featured = useMemo(() => {
    if (!desafios.length) return [];
    return [...desafios]
      .sort((a,b) => (b.musicasCount || 0) - (a.musicasCount || 0) || b.id - a.id)
      .slice(0, 3);
  }, [desafios]);

  const filtrados = useMemo(() => {
    let base = desafios; // inclui também os destacados
    if (generoFiltro.trim()) {
      const g = generoFiltro.toLowerCase();
      base = base.filter(d => (d.genero || '').toLowerCase().includes(g));
    }
    if (busca.trim()) {
      const n = busca.toLowerCase();
      base = base.filter(d => d.titulo.toLowerCase().includes(n));
    }
    return base;
  }, [desafios, generoFiltro, busca]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-8 relative">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-64 h-64 bg-gradient-to-br from-sky-400/40 to-emerald-400/40 blur-3xl rounded-full pointer-events-none" />
      <div className="flex flex-col gap-2">
        <div className="flex gap-3 justify-items-center">
        <button
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-6 h-6 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-gray-800" />
        </button>
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 tracking-tight">Selecionar Desafio</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-prose">Explore desafios oficiais dos devs e em breve criações da comunidade. Aplique filtros por gênero ou busque por nome.</p>
      </div>
      {loading && <div className="text-sm text-gray-500 dark:text-gray-400">Carregando desafios...</div>}
      {erro && <div className="text-sm text-red-600 dark:text-red-400">{erro}</div>}
      {!loading && desafios.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">Nenhum desafio disponível.</div>}

      {/* Sessão de Destaques */}
      <AnimatePresence>
        {featured.length > 0 && (
          <_m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Destaques</h3>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Top {featured.length}</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {featured.map(f => (
                <button
                  key={f.id}
                  onClick={()=> navigate(`/play/${f.id}`)}
                  className="group relative w-64 flex-shrink-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 backdrop-blur p-4 flex flex-col gap-3 shadow-sm overflow-hidden hover:shadow transition"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-indigo-600/10 via-fuchsia-600/10 to-rose-600/10" />
                  <div className="relative h-32 w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {f.desafioCapa ? (
                      <img src={f.desafioCapa} alt={f.titulo} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : <div className="flex items-center justify-center h-full text-[10px] text-gray-500 dark:text-gray-400">Sem capa</div>}
                    <span className="absolute top-1 right-1 bg-black/60 text-[10px] px-1.5 py-0.5 rounded text-white tracking-wide uppercase">{f.dificuldade}</span>
                  </div>
                  <div className="relative flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-sm truncate pr-4">{f.titulo}</span>
                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                      <span className="truncate max-w-[60%]">{f.genero}</span>
                      <span>{f.musicasCount} músicas</span>
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full text-black/90 shadow-inner">★</span>
                </button>
              ))}
            </div>
          </_m.div>
        )}
      </AnimatePresence>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Buscar Título</label>
          <input value={busca} onChange={e=> setBusca(e.target.value)} placeholder="Ex: Rock Clássico" className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col gap-1 flex-1 sm:w-64">
          <label className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Filtrar por Gênero (texto livre)</label>
          <input value={generoFiltro} onChange={e=> setGeneroFiltro(e.target.value)} placeholder="Ex: pop, indie, anos 80" className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {(generoFiltro || busca) && (
          <button onClick={()=> { setGeneroFiltro(''); setBusca(''); }} className="mt-4 sm:mt-auto text-[11px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 hover:bg-white/70 dark:hover:bg-zinc-900/70 transition">
            Limpar filtros
          </button>
        )}
      </div>

      {/* Desafios gerais */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Desafios dos Devs</h3>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{filtrados.length} encontrados</span>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map(d => (
            <li key={d.id}>
              <button
                onClick={()=> navigate(`/play/${d.id}`)}
                className="group w-full text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 backdrop-blur hover:bg-white/90 dark:hover:bg-zinc-900/70 transition flex gap-4 p-4 shadow-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-indigo-600/10 via-fuchsia-600/10 to-rose-600/10" />
                <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {d.desafioCapa ? (
                    <img
                      src={d.desafioCapa}
                      alt={`Capa do desafio ${d.titulo}`}
                      loading="lazy"
                      onError={e => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.classList.add('bg-gradient-to-br','from-indigo-500','to-purple-600','flex','items-center','justify-center'); e.currentTarget.parentElement.textContent=''; }}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400">Sem capa</div>
                  )}
                  <span className="absolute top-1 left-1 bg-black/60 text-[9px] px-1 rounded text-white tracking-wide uppercase">{d.dificuldade}</span>
                </div>
                <div className="relative flex flex-col min-w-0 gap-1 flex-1">
                  <span className="font-medium text-sm truncate pr-6">{d.titulo}</span>
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="truncate max-w-[60%]">{d.genero}</span>
                    <span>{d.musicasCount} música(s)</span>
                  </div>
                </div>
              </button>
            </li>
          ))}
          {(!filtrados.length && !loading) && (
            <li className="col-span-full text-[12px] text-gray-500 dark:text-gray-400">Nenhum desafio corresponde aos filtros.</li>
          )}
        </ul>
      </div>

      {/* Aba em breve da comunidade */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Desafios da Comunidade</h3>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">em breve</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Crie seus próprios desafios</span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">Uma área para a comunidade compartilhar coleções temáticas: décadas, festivais, trilhas de games e mais.</p>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">Curadoria</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/30">Votação</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/30">Ranking</span>
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur flex flex-col gap-3 items-start justify-center text-left">
            <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Planejamento</span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Estamos definindo o fluxo de submissão e moderação.</p>
          </div>
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Ideias?</span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Mande sugestões aos devs para priorizar recursos dessa seção.</p>
            <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Feedback</span>
          </div>
        </div>
      </div>
    </div>
  );
}
