import { useState } from 'react';
import { motion as Motion } from 'motion/react';
import MusicasPanel from './MusicasPanel';

export default function DesafioItem({ d, musicaState, onToggleMusicas, onAddMusica, onFormMusicaChange, onUpdate, onDelete, onAddMusicaCount, onRemoveMusica }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: d.titulo,
    genero: d.genero || '',
    dificuldade: d.dificuldade,
    desafioCapa: d.desafioCapa || ''
  });

  async function salvar() {
    setSaving(true);
    try {
      await onUpdate(d.id, form);
      setEditMode(false);
    } catch {
      // handled externamente
    } finally {
      setSaving(false);
    }
  }

  return (
  <Motion.li
      layout
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.6 }}
      className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-4 min-w-0">
            {(d.desafioCapa || (editMode && form.desafioCapa)) && (
              <img src={editMode ? form.desafioCapa : d.desafioCapa} alt="capa" className="h-16 w-16 object-cover rounded-lg border border-gray-300 dark:border-gray-700" />
            )}
            <div className="flex flex-col gap-1 truncate">
              {editMode ? (
                <input value={form.titulo} onChange={e=> setForm(f=>({...f, titulo: e.target.value}))} className="text-base font-semibold bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-0" />
              ) : (
                <h3 className="font-semibold text-base">{d.titulo}</h3>
              )}
              <span className="text-xs text-gray-500">ID {d.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {editMode ? (
                <div className="select-wrapper">
                  <select
                    name="dificuldade"
                    value={form.dificuldade}
                    onChange={e=> setForm(f=>({...f, dificuldade: e.target.value}))}
                    className="select-clean text-sm border border-gray-600 rounded bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="FACIL">Fácil</option>
                    <option value="MEDIO">Médio</option>
                    <option value="DIFICIL">Difícil</option>
                    <option value="MUITO_DIFICIL">Muito Difícil</option>
                    <option value="EXTREMO">Extremo</option>
                  </select>
                </div>
            ) : (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white font-medium">{d.dificuldade}</span>
            )}
            {editMode ? (
              <input value={form.genero} placeholder="Gênero" onChange={e=> setForm(f=>({...f, genero: e.target.value}))} className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-transparent" />
            ) : (
              <span className="text-xs text-gray-600 dark:text-gray-400">{d.genero || '—'}</span>
            )}
            {editMode && (
              <input value={form.desafioCapa} placeholder="URL capa" onChange={e=> setForm(f=>({...f, desafioCapa: e.target.value}))} className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-transparent w-40" />
            )}
            <div className="flex items-center gap-2 ml-2">
              {editMode ? (
                <>
                  <button disabled={saving} onClick={salvar} className="text-xs px-3 py-1 rounded bg-green-600 hover:bg-green-800 text-white hover:text-gray-800 disabled:opacity-50">Salvar</button>
                  <button disabled={saving} onClick={()=> { setEditMode(false); setForm({ titulo: d.titulo, genero: d.genero||'', dificuldade: d.dificuldade, desafioCapa: d.desafioCapa||'' }); }} className="text-xs px-3 py-1 rounded bg-gray-600 hover:bg-gray-800 text-white">Cancelar</button>
                </>
              ) : (
                <>
                  <button onClick={()=> setEditMode(true)} className="text-xs px-3 py-1 rounded-lg border border-yellow-600 bg-transparent hover:bg-yellow-800 text-white">Editar</button>
                  <button onClick={()=> onDelete(d.id)} className="text-xs px-3 py-1 rounded-lg border border-red-600 bg-transparent hover:bg-red-800 text-white">Excluir</button>
                  <button onClick={()=> onToggleMusicas(d.id)} className="text-xs px-3 py-1 rounded-lg border border-indigo-600 bg-transparent hover:bg-indigo-800 text-white">Músicas ({d.musicasCount ?? musicaState?.lista?.length ?? d.musicas?.length ?? 0})</button>
                </>
              )}
            </div>
          </div>
        </div>
        <MusicasPanel
          d={d}
          musicaState={musicaState}
          onFormChange={onFormMusicaChange}
          onAdd={(id)=> onAddMusica(id, ()=> onAddMusicaCount(d.id))}
          onRemove={onRemoveMusica}
        />
      </div>
  </Motion.li>
  );
}
