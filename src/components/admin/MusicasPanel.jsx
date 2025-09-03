import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import BotaoAnimado from '../reusable/botaoAnimado';

export default function MusicasPanel({ d, musicaState, onFormChange, onAdd, onRemove, onSelecionarSugestao, onLimparSelecao }) {
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
      <div className="flex flex-wrap gap-4 items-end relative">
        <div className="flex flex-col gap-1">
          <label className="text-xs" htmlFor={`musicaNome-${d.id}`}>Música</label>
          <div className="relative">
            <input id={`musicaNome-${d.id}`} value={musicaState?.form.musicaNome || ''} onChange={e=> { onFormChange(d.id,'musicaNome', e.target.value); onLimparSelecao(d.id); }} className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-transparent" placeholder="Nome da música" />
            {musicaState?.busca?.loading && <span className="absolute -bottom-4 left-1 text-[10px] text-gray-500">buscando...</span>}
            {!musicaState?.busca?.selecionada && (
              <ul className="absolute z-20 mt-1 w-[22rem] max-h-72 overflow-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg text-[11px] divide-y divide-gray-100 dark:divide-gray-800 custom-scroll">
                {musicaState?.busca?.loading && (
                  <li className="px-3 py-3 text-[11px] text-gray-500 flex gap-2 items-center">
                    <span className="animate-spin h-3 w-3 rounded-full border-2 border-indigo-500 border-t-transparent" /> Buscando...
                  </li>
                )}
                {!musicaState?.busca?.loading && (musicaState?.form?.musicaNome?.length >= 3) && musicaState?.busca?.sugestoes?.length === 0 && (
                  <li className="px-3 py-3 text-[11px] text-gray-500">Nenhum resultado</li>
                )}
                {!musicaState?.busca?.loading && musicaState?.busca?.sugestoes?.map(s => {
                  const ativa = tocando === s.deezerId;
                  const sel = musicaState.busca.selecionada?.deezerId === s.deezerId; // (sempre null aqui)
                  return (
                    <li
                      key={s.deezerId}
                      className={`group relative px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-fuchsia-50 dark:hover:from-indigo-600/20 dark:hover:to-fuchsia-600/20 transition-colors ${sel ? 'bg-indigo-100 dark:bg-indigo-600/30' : ''}`}
                      onClick={()=> { onSelecionarSugestao(d.id, s); onAdd(d.id, undefined, s.deezerId); }}
                    >
                      {s.imagem && (
                        <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
                          <img src={s.imagem} alt={s.titulo} className="h-full w-full object-cover" />
                          {s.preview && (
                            <button
                              type="button"
                              onClick={(e)=> { e.stopPropagation(); togglePreview(s); }}
                              className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition ${ativa ? 'opacity-100' : ''}`}
                              aria-label={ativa ? 'Pausar prévia' : 'Tocar prévia'}
                            >
                              {ativa ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white translate-x-[1px]" />}
                            </button>
                          )}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate font-medium text-[11px] text-gray-800 dark:text-gray-200">{s.titulo}</span>
                        <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">{s.artista}</span>
                      </div>
                      {s.duracao && (
                        <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 tabular-nums">{Math.floor(s.duracao/60)}:{String(s.duracao%60).padStart(2,'0')}</span>
                      )}
                      {s.preview && (
                        <span className="text-[9px] uppercase tracking-wide rounded px-1.5 py-0.5 bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300">Prévia</span>
                      )}
                      <span className="absolute left-0 top-0 h-full w-1 opacity-0 group-hover:opacity-100 bg-gradient-to-b from-indigo-500 to-fuchsia-500 rounded-r" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs" htmlFor={`artistaNome-${d.id}`}>Artista (opcional)</label>
          <input id={`artistaNome-${d.id}`} value={musicaState?.form.artistaNome || ''} onChange={e=> onFormChange(d.id,'artistaNome', e.target.value)} className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-transparent" placeholder="Artista" />
        </div>
        <div className="flex items-center gap-2">
          <BotaoAnimado
            mensagens={{ idle: 'Adicionar', loading: 'Adicionando...', success: 'Adicionada!', error: 'Erro' }}
            variantClasses={{
              idle: 'bg-green-600 hover:bg-green-500 text-white',
              loading: 'bg-green-600 text-white opacity-80',
              success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
              error: 'bg-red-600 hover:bg-red-500 text-white'
            }}
            className="h-8 px-4 text-xs rounded-lg font-medium"
            autoResetMs={1200}
            onClick={() => onAdd(d.id)}
            state={musicaState?.form.estado === 'idle' ? undefined : musicaState?.form.estado}
          />
          {musicaState?.form.estado === 'error' && <span className="text-xs text-red-600">{musicaState?.form.erro}</span>}
        </div>
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
