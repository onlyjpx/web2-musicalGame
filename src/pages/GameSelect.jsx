import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesafios } from '../hooks/useDesafios';

export default function GameSelect() {
  const { desafios, carregar, loading, erro } = useDesafios();
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6 relative">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-64 h-64 bg-gradient-to-br from-sky-400/40 to-emerald-400/40 blur-3xl rounded-full pointer-events-none" />
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">Escolha um Desafio</h2>
      {loading && <div className="text-sm text-gray-500 dark:text-gray-400">Carregando desafios...</div>}
      {erro && <div className="text-sm text-red-600 dark:text-red-400">{erro}</div>}
      {!loading && desafios.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">Nenhum desafio disponível.</div>}
      <ul className="grid gap-4 sm:grid-cols-2">
        {desafios.map(d => (
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
      </ul>
    </div>
  );
}
