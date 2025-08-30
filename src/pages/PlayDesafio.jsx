import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function PlayDesafio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [session, setSession] = useState(null);
  const [current, setCurrent] = useState(null);
  const [startError, setStartError] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { correta, titulo }
  const audioRef = useRef(null);
  const snippetTimerRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  async function start() {
      try {
        const { data } = await api.post(`/game/start/${id}`);
        setSession(data);
    setStartError('');
      } catch (e) {
    console.warn('Falha ao iniciar jogo', e);
    const msg = e?.response?.data?.error?.message || (e?.response?.status === 404 ? 'Desafio não encontrado' : 'Erro ao iniciar');
    setStartError(msg);
      }
    }
    start();
  }, [id, token, navigate]);

  function clearSnippetTimer() {
    if (snippetTimerRef.current) {
      clearTimeout(snippetTimerRef.current);
      snippetTimerRef.current = null;
    }
  }

  const playPreview = useCallback((url, secondsLimit) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearSnippetTimer();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(err => { if (err?.name !== 'AbortError') console.warn('play() falhou', err); });
      if (secondsLimit && secondsLimit > 0) {
        snippetTimerRef.current = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }, secondsLimit * 1000);
      }
      audio.onended = () => clearSnippetTimer();
      audio.onerror = () => clearSnippetTimer();
    } catch (err) {
      console.warn('Falha ao reproduzir preview', err);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    async function fetchCurrent() {
      try {
        const { data } = await api.get(`/game/current/${session.sessionId}`);
        setCurrent(data);
        setFeedback(null);
        setAnswer('');
        if (data?.preview) {
          playPreview(data.preview, data.snippetSeconds || session.snippetSeconds);
        }
      } catch (e) {
        console.warn('Erro ao carregar rodada', e);
      }
    }
    fetchCurrent();
  }, [session, playPreview]);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      clearSnippetTimer();
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!answer.trim() || submitting || !session || !current || current.finished) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/game/guess/${session.sessionId}`, { answer });
      // encerra áudio da rodada atual imediatamente
      if (audioRef.current) audioRef.current.pause();
      clearSnippetTimer();
      setFeedback({ correta: data.correta, titulo: data.titulo, artista: data.artista, finished: data.finished });
      setCurrent(prev => ({ ...prev, score: data.score, round: data.round, finished: data.finished }));
      if (data.finished) {
        if (audioRef.current) audioRef.current.pause();
        clearSnippetTimer();
        // fim
      } else {
        // Carregar próxima após pequeno delay
        setTimeout(async () => {
          try {
            const { data: next } = await api.get(`/game/current/${session.sessionId}`);
            setCurrent(next);
            setFeedback(null);
            setAnswer('');
            if (next?.preview) {
              playPreview(next.preview, next.snippetSeconds || session.snippetSeconds);
            }
          } catch (e) {
            console.warn('Erro ao avançar rodada', e);
          }
        }, 1600);
      }
    } catch (e) {
      console.warn('Erro ao enviar resposta', e);
    } finally {
      setSubmitting(false);
    }
  }

  if (startError) {
    return (
      <div className="p-6 flex flex-col gap-4 max-w-sm mx-auto">
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{startError}</p>
        <button onClick={()=> navigate('/jogar')} className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm shadow">Escolher outro desafio</button>
      </div>
    );
  }

  if (!session || !current) {
    return <div className="p-6 text-sm text-gray-600 dark:text-gray-400">Preparando jogo...</div>;
  }

  if (current.finished) {
    return (
      <div className="p-6 flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">Fim do Desafio!</h2>
        <p className="text-sm">Pontuação final: <span className="font-bold">{current.score}</span></p>
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm shadow">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col gap-5 relative">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 blur-3xl rounded-full pointer-events-none" />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Rodada {current.round} / {current.totalRounds}</span>
        <span>Pontos: {current.score}</span>
      </div>
      <div className="aspect-video w-full rounded-xl flex items-center justify-center relative overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-zinc-200 dark:border-zinc-800">
        {current.imagem && <img src={current.imagem} alt="Capa" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <span className="relative z-10 text-sm text-gray-700 dark:text-gray-300">Escutando preview...</span>
        <div className="absolute inset-0 opacity-0 pointer-events-none bg-gradient-to-br from-indigo-600/10 via-fuchsia-600/10 to-rose-600/10" />
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-300">Tempo de preview (dificuldade): {session.snippetSeconds}s</p>
      <form onSubmit={submit} className="flex gap-2">
        <input value={answer} onChange={e=> setAnswer(e.target.value)} placeholder="Digite o nome da música" className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button disabled={!answer.trim() || submitting} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm shadow">{submitting ? '...' : 'Enviar'}</button>
      </form>
      {feedback && (
        <div className={`text-sm font-medium ${feedback.correta ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-400'}`}>
          {feedback.correta ? 'Acertou!' : 'Errou!'} - {feedback.titulo}
        </div>
      )}
    </div>
  );
}
