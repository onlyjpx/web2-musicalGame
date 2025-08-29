import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { mapApiError } from '../utils/errorMap';

// Mantém estado de músicas por desafio
export function useMusicasDesafio({ onUpdateMusicasCount } = {}) {
  const [musicas, setMusicas] = useState({});

  const init = useCallback((id) => {
    setMusicas(prev => prev[id] ? prev : ({ ...prev, [id]: { lista: [], loading: false, erro: '', expanded: false, form: { musicaNome: '', artistaNome: '', estado: 'idle', erro: '' } } }));
  }, []);

  const toggle = useCallback(async (id) => {
    init(id);
    setMusicas(prev => ({ ...prev, [id]: { ...prev[id], expanded: !prev[id].expanded } }));
    if (!musicas[id]?.expanded) { // abrindo
      setMusicas(prev => ({ ...prev, [id]: { ...prev[id], loading: true, erro: '' } }));
      try {
        const { data } = await api.get(`/desafio-musica/${id}`);
        setMusicas(prev => ({ ...prev, [id]: { ...prev[id], lista: data, loading: false } }));
      } catch (e) {
        setMusicas(prev => ({ ...prev, [id]: { ...prev[id], loading: false, erro: e.response?.data?.error || 'Erro ao carregar músicas' } }));
      }
    }
  }, [init, musicas]);

  const handleFormChange = useCallback((id, field, value) => {
    init(id);
    setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, [field]: value } } }));
  }, [init]);

  const adicionar = useCallback(async (id, afterAdd) => {
    init(id);
    const state = musicas[id];
    const { musicaNome, artistaNome } = state.form;
    setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, estado: 'loading', erro: '' } } }));
    if (!musicaNome.trim()) {
      setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, estado: 'error', erro: 'Nome obrigatório' } } }));
      setTimeout(()=> setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, estado: 'idle' } } })), 1400);
      return;
    }
    try {
      const { data } = await api.post(`/desafio-musica/${id}`, { musicaNome, artistaNome: artistaNome || undefined });
      // data: { musicas: [...], musicasCount }
  setMusicas(prev => ({ ...prev, [id]: { ...prev[id], lista: data.musicas, form: { musicaNome: '', artistaNome: '', estado: 'success', erro: '' } } }));
      onUpdateMusicasCount?.(id, data.musicasCount);
      afterAdd?.();
      setTimeout(()=> setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, estado: 'idle' } } })), 1100);
    } catch (e) {
      setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, estado: 'error', erro: mapApiError(e) } } }));
      setTimeout(()=> setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, estado: 'idle' } } })), 1700);
    }
  }, [init, musicas, onUpdateMusicasCount]);

  const remover = useCallback(async (id, musica, afterRemove) => {
    init(id);
    const deezerId = musica.deezerId;
    setMusicas(prev => ({ ...prev, [id]: { ...prev[id], removendo: { ...(prev[id].removendo||{}), [deezerId]: true } } }));
    try {
      // Backend espera musicaNome e artistaNome para resolver deezerId
  const { data: delResp } = await api.delete(`/desafio-musica/${id}`, { data: { musicaNome: musica.titulo, artistaNome: musica.artista } });
  setMusicas(prev => ({ ...prev, [id]: { ...prev[id], lista: delResp.musicas, removendo: { ...(prev[id].removendo||{}), [deezerId]: false } } }));
  onUpdateMusicasCount?.(id, delResp.musicasCount);
      afterRemove?.();
    } catch (e) {
  setMusicas(prev => ({ ...prev, [id]: { ...prev[id], erro: mapApiError(e), removendo: { ...(prev[id].removendo||{}), [deezerId]: false } } }));
    }
  }, [init, onUpdateMusicasCount]);

  return { musicas, toggle, handleFormChange, adicionar, remover, init, setMusicas };
}
