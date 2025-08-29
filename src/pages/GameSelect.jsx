import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesafios } from '../hooks/useDesafios';

export default function GameSelect() {
  const { desafios, carregar, loading, erro } = useDesafios();
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Escolha um Desafio</h2>
      {loading && <div className="text-sm text-gray-500">Carregando desafios...</div>}
      {erro && <div className="text-sm text-red-600">{erro}</div>}
      {!loading && desafios.length === 0 && <div className="text-sm text-gray-500">Nenhum desafio disponível.</div>}
      <ul className="grid gap-4 sm:grid-cols-2">
        {desafios.map(d => (
          <li key={d.id}>
            <button
              onClick={()=> navigate(`/play/${d.id}`)}
              className="group w-full text-left rounded border border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-gray-50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex gap-3 p-3"
            >
              <div className="relative h-16 w-16 shrink-0 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                <span className="absolute top-1 left-1 bg-black/60 text-[9px] px-1 rounded text-white tracking-wide">{d.dificuldade}</span>
              </div>
              <div className="flex flex-col min-w-0 gap-1 flex-1">
                <span className="font-medium text-sm truncate">{d.titulo}</span>
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
