import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { mapApiError } from '../utils/errorMap';

// Mantém estado de músicas por desafio
export function useMusicasDesafio({ onUpdateMusicasCount } = {}) {
  const [musicas, setMusicas] = useState({});

  const init = useCallback((id) => {
  setMusicas(prev => prev[id] ? prev : ({ ...prev, [id]: { lista: [], loading: false, erro: '', expanded: false, form: { musicaNome: '', artistaNome: '', estado: 'idle', erro: '' }, busca: { sugestoes: [], loading: false, selecionada: null } } }));
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
    if (field === 'musicaNome') {
      // dispara busca debounce
      const nome = value;
      if (nome.length < 3) {
        setMusicas(prev => ({ ...prev, [id]: { ...prev[id], busca: { ...prev[id].busca, sugestoes: [], selecionada: null } } }));
        return;
      }
      // marcar loading e agendar fetch
      setMusicas(prev => {
        const existingTimer = prev[id]?.busca?.timer;
        if (existingTimer) clearTimeout(existingTimer);
        return ({ ...prev, [id]: { ...prev[id], busca: { ...prev[id].busca, loading: true } } });
      });
      const timer = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ nome });
          const { data } = await api.get(`/deezer/search?${params.toString()}`);
          setMusicas(p => ({ ...p, [id]: { ...p[id], busca: { ...p[id].busca, sugestoes: data, loading: false } } }));
  } catch {
          setMusicas(p => ({ ...p, [id]: { ...p[id], busca: { ...p[id].busca, sugestoes: [], loading: false } } }));
        }
      }, 400);
      setMusicas(prev => ({ ...prev, [id]: { ...prev[id], busca: { ...prev[id].busca, timer } } }));
    }
  }, [init]);

  const adicionar = useCallback(async (id, afterAdd, directDeezerId) => {
    init(id);
    const state = musicas[id];
    const { musicaNome, artistaNome } = state.form;
    const selecionada = state.busca?.selecionada;
    setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, estado: 'loading', erro: '' } } }));
    if (!directDeezerId && !selecionada && !musicaNome.trim()) {
      setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, estado: 'error', erro: 'Nome obrigatório' } } }));
      setTimeout(()=> setMusicas(prev => ({ ...prev, [id]: { ...prev[id], form: { ...prev[id].form, estado: 'idle' } } })), 1400);
      return;
    }
    try {
      const payload = directDeezerId ? { deezerId: directDeezerId } : (selecionada ? { deezerId: selecionada.deezerId } : { musicaNome, artistaNome: artistaNome || undefined });
      const { data } = await api.post(`/desafio-musica/${id}`, payload);
      setMusicas(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          lista: data.musicas,
          form: { musicaNome: '', artistaNome: '', estado: 'success', erro: '' },
          busca: { ...prev[id].busca, selecionada: null, sugestoes: [] }
        }
      }));
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
  const { data: delResp } = await api.delete(`/desafio-musica/${id}`, { data: { deezerId: musica.deezerId } });
  setMusicas(prev => ({ ...prev, [id]: { ...prev[id], lista: delResp.musicas, removendo: { ...(prev[id].removendo||{}), [deezerId]: false } } }));
  onUpdateMusicasCount?.(id, delResp.musicasCount);
      afterRemove?.();
    } catch (e) {
  setMusicas(prev => ({ ...prev, [id]: { ...prev[id], erro: mapApiError(e), removendo: { ...(prev[id].removendo||{}), [deezerId]: false } } }));
    }
  }, [init, onUpdateMusicasCount]);

  const selecionarSugestao = useCallback((id, sugestao) => {
    init(id);
    setMusicas(prev => ({ ...prev, [id]: { ...prev[id], busca: { ...prev[id].busca, selecionada: sugestao }, form: { ...prev[id].form, musicaNome: sugestao?.titulo || prev[id].form.musicaNome } } }));
  }, [init]);

  const limparSelecao = useCallback((id) => {
    init(id);
    setMusicas(prev => ({ ...prev, [id]: { ...prev[id], busca: { ...prev[id].busca, selecionada: null } } }));
  }, [init]);

  return { musicas, toggle, handleFormChange, adicionar, remover, init, setMusicas, selecionarSugestao, limparSelecao };
}
