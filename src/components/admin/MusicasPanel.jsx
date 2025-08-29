import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function MusicasPanel({ d, musicaState, onFormChange, onAdd, onRemove }) {
  const [selecionada, setSelecionada] = useState(null); // deezerId selecionado
  const [tocando, setTocando] = useState(null); // deezerId em reprodução
  const audioRef = useRef(null);

  useEffect(() => {
    return () => { // cleanup ao desmontar
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  function togglePreview(m) {
    if (!m.preview) return;
    if (tocando === m.deezerId) {
      // pausar
      if (audioRef.current) audioRef.current.pause();
      setTocando(null);
      return;
    }
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(m.preview);
      audioRef.current = audio;
      audio.play().then(() => {
        setTocando(m.deezerId);
      }).catch(() => {
        setTocando(null);
      });
      audio.onended = () => setTocando(null);
      audio.onerror = () => setTocando(null);
    } catch {
      setTocando(null);
    }
  }
  if (!musicaState?.expanded) return null;
  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4 flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs" htmlFor={`musicaNome-${d.id}`}>Música</label>
          <input id={`musicaNome-${d.id}`} value={musicaState?.form.musicaNome || ''} onChange={e=> onFormChange(d.id,'musicaNome', e.target.value)} className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-transparent" placeholder="Nome da música" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs" htmlFor={`artistaNome-${d.id}`}>Artista (opcional)</label>
          <input id={`artistaNome-${d.id}`} value={musicaState?.form.artistaNome || ''} onChange={e=> onFormChange(d.id,'artistaNome', e.target.value)} className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-transparent" placeholder="Artista" />
        </div>
        <button disabled={musicaState?.form.estado === 'loading'} onClick={()=> onAdd(d.id)} className="h-8 px-3 rounded bg-green-600 hover:bg-green-800 text-white text-xs disabled:opacity-50">{musicaState?.form.estado === 'loading' ? 'Adicionando...' : musicaState?.form.estado === 'success' ? 'Adicionada!' : 'Adicionar'}</button>
        {musicaState?.form.estado === 'error' && <span className="text-xs text-red-600">{musicaState?.form.erro}</span>}
      </div>
      {musicaState?.loading && <div className="text-xs text-gray-500">Carregando músicas...</div>}
      {musicaState?.erro && <div className="text-xs text-red-600">{musicaState?.erro}</div>}
      {!musicaState?.loading && musicaState?.lista?.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {musicaState.lista.map(m => {
            const removendo = musicaState.removendo?.[m.deezerId];
            const ativa = selecionada === m.deezerId;
            return (
              <li
                key={m.deezerId}
                onClick={() => setSelecionada(prev => prev === m.deezerId ? null : m.deezerId)}
                className={`group relative p-2 rounded border border-gray-200 dark:border-gray-800 flex gap-3 items-center bg-gray-50 hover:bg-gray-200 dark:bg-gray-800/40 dark:hover:bg-gray-900 cursor-pointer transition ring-offset-1 ${ativa ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}
              >
                {m.imagem && (
                  <div className="relative h-12 w-12 shrink-0">
                    <img src={m.imagem} alt={m.titulo} className="h-12 w-12 object-cover rounded pointer-events-none" />
                    {m.preview && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); togglePreview(m); }}
                        className={`absolute inset-0 flex items-center justify-center rounded bg-black/40 transition-opacity ${tocando === m.deezerId ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} hover:bg-black/55`}
                        aria-label={tocando === m.deezerId ? 'Pausar prévia' : 'Tocar prévia'}
                      >
                        {tocando === m.deezerId ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white translate-x-[1px]" />}
                      </button>
                    )}
                  </div>
                )}
                <div className="flex flex-col min-w-0 flex-1 pointer-events-none select-none">
                  <span className="text-xs font-medium truncate">{m.titulo}</span>
                  <span className="text-[10px] text-gray-500 truncate">{m.artista}</span>
                </div>
                {ativa && (
                  <button
                    type="button"
                    disabled={removendo}
                    onClick={(e)=> { e.stopPropagation(); onRemove(d.id, m); setSelecionada(null); }}
                    className="text-[10px] px-2 py-1 rounded bg-red-600 text-white disabled:opacity-50"
                  >
                    {removendo ? '...' : 'Remover'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
