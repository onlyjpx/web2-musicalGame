import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { mapApiError } from '../utils/errorMap';

export function useDesafios() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true); setErro('');
    try {
      const { data } = await api.get('/desafios');
      // backend já devolve ordenado desc
      setDesafios(data);
    } catch (e) {
      setErro(mapApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const criar = useCallback(async (payload) => {
  const { data } = await api.post('/desafios', payload);
    setDesafios(prev => [data, ...prev]);
    return data;
  }, []);

  const atualizar = useCallback(async (id, payload) => {
  const { data } = await api.put(`/desafios/${id}`, payload);
    setDesafios(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    return data;
  }, []);

  const remover = useCallback(async (id) => {
  await api.delete(`/desafios/${id}`);
    setDesafios(prev => prev.filter(d => d.id !== id));
  }, []);

  return { desafios, loading, erro, carregar, criar, atualizar, remover, setDesafios };
}
