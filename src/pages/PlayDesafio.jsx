import { useEffect, useRef, useState, useCallback } from 'react';
import { motion as _m, AnimatePresence } from 'motion/react';
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
  const [previousGuesses, setPreviousGuesses] = useState([]); // {texto, correta, matchType}
  const [progress, setProgress] = useState(0); // 0..1
  const [timeLeft, setTimeLeft] = useState(null);
  const [snippetEnded, setSnippetEnded] = useState(false);
  const [scoreDelta, setScoreDelta] = useState(null); // animação de incremento
  const [pendingFinal, setPendingFinal] = useState(false); // indica exibição da camada final
  const [finalScore, setFinalScore] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [lastPoints, setLastPoints] = useState(null); // {pontosGanhos,pontosBase,bonusTempo}
  const [showBonusDetail, setShowBonusDetail] = useState(false);
  // Limites de repetição de preview por dificuldade
  const REPLAY_LIMITS = { FACIL: 7, MEDIO: 5, DIFICIL: 3, MUITO_DIFICIL: 2, EXTREMO: 1 };
  const [replayCount, setReplayCount] = useState(0); // replays manuais efetuados nesta rodada
  // Streak
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streakProgress, setStreakProgress] = useState(1); // 1..0
  const streakIntervalRef = useRef(null);
  const streakStartRef = useRef(null);
  const streakWindowRef = useRef(4000); // ms
  const inputRef = useRef(null);
  const playbackStartRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const replayCooldownRef = useRef(false);
  const audioRef = useRef(null);
  const snippetTimerRef = useRef(null);

  function clearStreakInterval() {
    if (streakIntervalRef.current) {
      clearInterval(streakIntervalRef.current);
      streakIntervalRef.current = null;
    }
  }

  const startStreakWindow = useCallback((snippetSeconds) => {
    clearStreakInterval();
    // janela proporcional à duração, levemente maior (ajuste pedido) e limites suavemente ampliados
    const windowMs = Math.min(7000, Math.max(3000, (snippetSeconds || 5) * 1000 * 0.9));
    streakWindowRef.current = windowMs;
    streakStartRef.current = Date.now();
    setStreakProgress(1);
    streakIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - streakStartRef.current;
      const p = 1 - elapsed / streakWindowRef.current;
      if (p <= 0) {
        setStreakProgress(0);
        clearStreakInterval();
      } else {
        setStreakProgress(p);
      }
    }, 80);
  }, []);

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
          setSnippetEnded(true);
        }, secondsLimit * 1000);
      }
      audio.onended = () => clearSnippetTimer();
      audio.onerror = () => clearSnippetTimer();
      // reinicia tracking de progresso
      playbackStartRef.current = Date.now();
      setSnippetEnded(false);
      setProgress(0);
      setTimeLeft(secondsLimit);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (secondsLimit) {
        progressIntervalRef.current = setInterval(() => {
          const elapsed = (Date.now() - playbackStartRef.current) / 1000;
          const p = Math.min(1, elapsed / secondsLimit);
          setProgress(p);
          setTimeLeft(Math.max(0, secondsLimit - elapsed));
          if (p >= 1) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        }, 100);
      }
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
  setPreviousGuesses([]);
  // reset replay counter per música
  setReplayCount(0);
    // foco no input
    setTimeout(() => inputRef.current?.focus(), 10);
  if (data?.preview) {
          playPreview(data.preview, data.snippetSeconds || session.snippetSeconds);
        }
  startStreakWindow(data.snippetSeconds || session.snippetSeconds);
      } catch (e) {
        console.warn('Erro ao carregar rodada', e);
      }
    }
    fetchCurrent();
  }, [session, playPreview, startStreakWindow]);

  useEffect(() => {
    return () => {
  if (audioRef.current) audioRef.current.pause();
      clearSnippetTimer();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  clearStreakInterval();
    };
  }, []);

  // atalhos de teclado: ESC limpa resposta, Ctrl+K foca, Enter já nativo
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setAnswer('');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!answer.trim() || submitting || !session || !current || current.finished) return;
    setSubmitting(true);
    try {
      const texto = answer.trim();
      const { data } = await api.post(`/game/guess/${session.sessionId}`, { answer: texto });
      // encerra áudio da rodada atual imediatamente
      if (audioRef.current) audioRef.current.pause();
      clearSnippetTimer();
      setFeedback({ correta: data.correta, titulo: data.titulo, artista: data.artista, finished: data.finished, matchType: data.matchType, pontosGanhos: data.pontosGanhos, pontosBase: data.pontosBase, bonusTempo: data.bonusTempo });
      setPreviousGuesses(prev => [...prev, { texto, correta: data.correta, matchType: data.matchType }]);
      // Streak logic
      if (data.correta) {
        setAcertos(a=> a+1);
        const within = streakStartRef.current && (Date.now() - streakStartRef.current) <= streakWindowRef.current;
        setStreak(prev => {
          const next = within ? prev + 1 : 1; // reinicia se estourou tempo
          if (next > bestStreak) setBestStreak(next);
          return next;
        });
      } else {
        setErros(e=> e+1);
        setStreak(0);
      }
      clearStreakInterval(); // para não continuar drenando pós resposta
      // animação de pontuação
      if (data.correta && data.pontosGanhos) {
        setScoreDelta(`+${data.pontosGanhos}`);
        setLastPoints({ pontosGanhos: data.pontosGanhos, pontosBase: data.pontosBase, bonusTempo: data.bonusTempo });
        setShowBonusDetail(true);
        setTimeout(() => setScoreDelta(null), 1400);
        setTimeout(() => setShowBonusDetail(false), 2500);
      }
      setCurrent(prev => ({ ...prev, score: data.score, round: data.round, finished: data.finished }));
      if (data.finished) {
        if (audioRef.current) audioRef.current.pause();
        clearSnippetTimer();
        setFinalScore(data.score);
        // pequena espera para permitir ver feedback e animação de score
        setTimeout(() => setPendingFinal(true), 500);
      } else {
        // Carregar próxima após pequeno delay
        setTimeout(async () => {
          try {
            const { data: next } = await api.get(`/game/current/${session.sessionId}`);
            setCurrent(next);
            setFeedback(null);
            setAnswer('');
            setPreviousGuesses([]);
            // reset replay counter per música
            setReplayCount(0);
            if (next?.preview) {
              playPreview(next.preview, next.snippetSeconds || session.snippetSeconds);
            }
            startStreakWindow(next.snippetSeconds || session.snippetSeconds);
            setTimeout(() => inputRef.current?.focus(), 50);
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

  // Função para reiniciar mesmo desafio (definida antes de qualquer return condicional para obedecer regras de hooks)
  const restart = useCallback(() => {
    if (!session) return;
    setPendingFinal(false);
    setFinalScore(null);
    setFeedback(null);
    setAnswer('');
    setPreviousGuesses([]);
    setProgress(0);
    setTimeLeft(null);
    setSnippetEnded(false);
  setScoreDelta(null);
  setAcertos(0);
  setErros(0);
  setLastPoints(null);
  setShowBonusDetail(false);
  setStreak(0);
  setBestStreak(0);
  setStreakProgress(1);
  clearStreakInterval();
  setReplayCount(0);
    (async () => {
      try {
        const { data } = await api.post(`/game/start/${id}`);
        setSession(data);
      } catch (e) {
        console.warn('Falha ao reiniciar', e);
      }
    })();
  }, [session, id]);


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


  const snippetSeconds = current?.snippetSeconds || session.snippetSeconds;
  const segundosRestantes = timeLeft != null ? Math.ceil(timeLeft) : snippetSeconds;
  const showCover = session?.dificuldade !== 'EXTREMO';
  const replayLimit = REPLAY_LIMITS[session?.dificuldade] ?? 3;
  const remainingReplays = Math.max(0, replayLimit - replayCount);
  const replayRatio = replayLimit ? remainingReplays / replayLimit : 0;
  let replayColor = 'from-indigo-500 to-purple-600 border-indigo-400/40 text-indigo-600 dark:text-indigo-300';
  if (replayRatio <= 0) replayColor = 'from-gray-400 to-gray-500 border-gray-400/40 text-gray-500 dark:text-gray-400';
  else if (replayRatio < 0.34) replayColor = 'from-rose-500 to-red-500 border-rose-400/40 text-rose-600 dark:text-rose-300';
  else if (replayRatio < 0.67) replayColor = 'from-amber-500 to-yellow-500 border-amber-400/40 text-amber-600 dark:text-amber-300';

  return (
  <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6 relative">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 blur-3xl rounded-full pointer-events-none" />
      {/* Primary Stats Header */}
      <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 shadow-sm">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Pontuação</span>
          <div className="flex items-end justify-center gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums" aria-live="polite">{current.score}</span>
            <AnimatePresence>
              {scoreDelta && (
                <_m.span
                  key={scoreDelta}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6 }}
                  className="text-emerald-500 text-lg font-semibold"
                  aria-label={`Incremento de ${scoreDelta}`}
                >{scoreDelta}</_m.span>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {showBonusDetail && lastPoints && (
              <_m.div
                key={lastPoints.pontosGanhos + '-detail'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1 text-[10px] flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400"
              >
                <span className="font-semibold">+{lastPoints.pontosGanhos}</span>
                <span className="text-gray-400 dark:text-gray-500">=</span>
                <span className="text-indigo-600 dark:text-indigo-400">{lastPoints.pontosBase}</span>
                <span className="text-gray-400 dark:text-gray-500">+</span>
                <span className="text-fuchsia-600 dark:text-fuchsia-400">{lastPoints.bonusTempo}</span>
              </_m.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 shadow-sm">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Rodada</span>
          <span className="text-xl font-bold tabular-nums" aria-live="polite">{current.round}<span className="text-gray-400 dark:text-gray-500 text-base">/{current.totalRounds}</span></span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Dificuldade <span className="font-medium text-gray-700 dark:text-gray-200">{session.dificuldade}</span></span>
        </div>
        <div className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 shadow-sm">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Tempo</span>
          <span className="text-xl font-bold tabular-nums" aria-live="polite">{segundosRestantes}s</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Preview {snippetSeconds}s</span>
        </div>
        <div className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 shadow-sm">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Acertos</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{acertos}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Erros {erros}</span>
        </div>
      </div>
      {/* Streak Indicator */}
      <AnimatePresence>
        {streak > 0 && (
          <_m.div
            key={streak}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col gap-1 text-[11px] mb-1"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold tracking-wide">Streak {streak}x</span>
              {streakProgress <= 0 && <span className="text-[10px] text-gray-400 dark:text-gray-500">janela expirada</span>}
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200/60 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full transition-[width] duration-80 ease-linear"
                style={{
                  width: `${Math.max(0, Math.min(1, streakProgress)) * 100}%`,
                  background: 'linear-gradient(90deg,var(--c1,#10b981),var(--c2,#f59e0b),var(--c3,#ef4444))',
                  filter: 'hue-rotate(' + (120 - streakProgress * 120) + 'deg)'
                }}
              />
            </div>
          </_m.div>
        )}
      </AnimatePresence>
  <div className="flex flex-col gap-3">
        {showCover && current.imagem ? (
          <div className={`relative w-full aspect-video flex rounded-2xl overflow-hidden border backdrop-blur-xl shadow-xl transition-all duration-500 ${feedback?.correta ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-500/25 via-emerald-500/15 to-emerald-500/5 dark:from-emerald-600/25 dark:via-emerald-600/10 dark:to-emerald-600/5' : 'border-zinc-200/70 dark:border-zinc-800/70 bg-gradient-to-br from-white/80 via-white/60 to-white/30 dark:from-zinc-900/80 dark:via-zinc-900/50 dark:to-zinc-900/30'}`}>
            {/* background com blur da div da preview */}
            <div className="absolute inset-0">
              <img src={current.imagem} alt="ambient" className="w-full h-full object-cover scale-110 blur-2xl opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/20 dark:from-black/60 dark:via-transparent dark:to-black/40" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center z-10">
              <AnimatePresence>
                {!feedback?.correta && (
                  <_m.div
                    key="conteudo-preview"
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="flex flex-col items-center justify-center gap-5"
                  >
                    <div className="relative group">
                      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-indigo-500/0 via-fuchsia-500/0 to-rose-500/0 group-hover:from-indigo-500/10 group-hover:via-fuchsia-500/10 group-hover:to-rose-500/10 blur-xl transition-opacity" />
                      <_m.img
                        key={current.imagem + 'capa'}
                        src={current.imagem}
                        alt="Capa"
                        initial={{ rotate: -2 }}
                        animate={{ rotate: 0 }}
                        className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl object-cover shadow-2xl ring-2 ring-white/30 dark:ring-white/10"
                      />
                      <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-white/0 group-hover:to-white/10 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-[10px] font-semibold tracking-wide text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">Preview</span>
                        <span className="px-2 py-0.5 rounded-md bg-gray-500/15 text-[10px] tracking-wide text-gray-600 dark:text-gray-300 border border-gray-500/30">Rodada {current.round}/{current.totalRounds}</span>
                        <span className="px-2 py-0.5 rounded-md bg-fuchsia-500/15 text-[10px] tracking-wide text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-500/30">{session.dificuldade}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{snippetEnded ? 'Preview finalizado' : 'Escutando preview...'}</span>
                      <div className="flex flex-col gap-1 mt-1 w-full max-w-xs">
                        <div className="h-2.5 rounded bg-gray-300/60 dark:bg-gray-700/60 w-5/6 mx-auto animate-pulse" />
                        <div className="h-2.5 rounded bg-gray-300/50 dark:bg-gray-700/50 w-2/3 mx-auto animate-pulse delay-75" />
                        <div className="flex justify-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200/70 dark:bg-gray-800/70 text-gray-500 dark:text-gray-400 border border-gray-300/60 dark:border-gray-700/60">Álbum ?</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200/70 dark:bg-gray-800/70 text-gray-500 dark:text-gray-400 border border-gray-300/60 dark:border-gray-700/60">Ano ?</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200/70 dark:bg-gray-800/70 text-gray-500 dark:text-gray-400 border border-gray-300/60 dark:border-gray-700/60">Gênero ?</span>
                        </div>
                      </div>
                    </div>
                  </_m.div>
                )}
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 dark:bg-black/20 overflow-hidden">
              <div className={`h-full ${feedback?.correta ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500'}`} style={{ width: `${Math.min(100, progress * 100)}%` }} />
            </div>
            <AnimatePresence>
              {feedback?.correta && (
                <_m.div
                  key="acerto-overlay"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 p-6 pointer-events-none"
                  aria-live="assertive"
                >
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-semibold tracking-wide shadow-sm backdrop-blur-sm">ACERTOU</span>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm sm:text-base font-semibold text-white drop-shadow-sm line-clamp-2">{feedback.titulo}</p>
                    {feedback.artista && <p className="text-xs text-emerald-100/90">{feedback.artista}</p>}
                  </div>
                  {(feedback.pontosGanhos || lastPoints) && (
                    <div className="mt-1 text-[11px] flex items-center gap-1 text-emerald-100/90 font-medium">
                      <span className="text-emerald-300">+{feedback.pontosGanhos || lastPoints?.pontosGanhos}</span>
                      {typeof feedback.pontosBase === 'number' && typeof feedback.bonusTempo === 'number' && (
                        <span className="opacity-80">= {feedback.pontosBase} + {feedback.bonusTempo}</span>
                      )}
                      {feedback.matchType && <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/25 border border-emerald-400/40 text-[10px] uppercase tracking-wide">{feedback.matchType}</span>}
                    </div>
                  )}
                </_m.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className={`aspect-video w-full rounded-xl flex items-center justify-center relative overflow-hidden backdrop-blur border transition-all duration-500 ${feedback?.correta ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-600/25 via-emerald-600/10 to-emerald-600/5' : 'bg-white/70 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'}`}>
            {!feedback?.correta && (
              <span className="relative z-10 text-sm text-gray-700 dark:text-gray-300">{snippetEnded ? 'Preview finalizado' : 'Escutando preview...'}</span>
            )}
            <div className={`absolute inset-0 pointer-events-none ${feedback?.correta ? 'bg-gradient-to-br from-emerald-400/20 via-emerald-500/15 to-emerald-600/10' : 'bg-gradient-to-br from-indigo-600/10 via-fuchsia-600/10 to-rose-600/10'}`} />
            {session?.dificuldade === 'EXTREMO' && !feedback?.correta && (
              <span className="absolute bottom-2 right-3 text-[10px] text-rose-500/80 font-semibold tracking-wide">Sem capa nesta dificuldade</span>
            )}
            <AnimatePresence>
              {feedback?.correta && (
                <_m.div
                  key="acerto-overlay-sem-capa"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 p-6"
                  aria-live="assertive"
                >
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-semibold tracking-wide">ACERTOU</span>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm sm:text-base font-semibold text-white drop-shadow-sm line-clamp-2">{feedback.titulo}</p>
                    {feedback.artista && <p className="text-xs text-emerald-100/90">{feedback.artista}</p>}
                  </div>
                  {(feedback.pontosGanhos || lastPoints) && (
                    <div className="mt-1 text-[11px] flex items-center gap-1 text-emerald-100/90 font-medium">
                      <span className="text-emerald-300">+{feedback.pontosGanhos || lastPoints?.pontosGanhos}</span>
                      {typeof feedback.pontosBase === 'number' && typeof feedback.bonusTempo === 'number' && (
                        <span className="opacity-80">= {feedback.pontosBase} + {feedback.bonusTempo}</span>
                      )}
                      {feedback.matchType && <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/25 border border-emerald-400/40 text-[10px] uppercase tracking-wide">{feedback.matchType}</span>}
                    </div>
                  )}
                </_m.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <div
            className="h-3 w-full rounded-full bg-gray-200/70 dark:bg-gray-800 overflow-hidden relative"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do preview"
          >
            <div className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 transition-[width] duration-150 ease-linear" style={{ width: `${Math.min(100, progress * 100)}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span>Preview {snippetSeconds}s</span>
            <span>Restante {segundosRestantes}s</span>
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3" aria-label="Palpite da música">
        <div className="flex flex-col gap-1">
          <label htmlFor="answer" className="text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400 font-medium">Nome da Música</label>
          <div className="flex gap-2">
            <input id="answer" ref={inputRef} value={answer} onChange={e=> setAnswer(e.target.value)} placeholder="Digite o nome da música" className="flex-1 text-base px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-required="true" autoComplete="off" />
            <button type="submit" disabled={!answer.trim() || submitting} className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-semibold shadow min-w-[96px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{submitting ? '...' : 'Enviar'}</button>
          </div>
          <div className="flex gap-3 flex-wrap text-[10px] text-gray-500 dark:text-gray-400 pt-1 items-center">
            <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Esc limpa</span>
            <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Ctrl+K foco</span>
            <button
              type="button"
              onClick={() => {
                if (!current?.preview || replayCooldownRef.current) return;
                if (replayCount >= replayLimit) return;
                replayCooldownRef.current = true;
                playPreview(current.preview, snippetSeconds);
                setReplayCount(c => c + 1);
                setTimeout(() => { replayCooldownRef.current = false; }, 1500);
              }}
              className={`relative ml-auto text-[11px] font-medium px-3 py-1.5 rounded-lg border bg-gradient-to-r ${replayColor} disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 overflow-hidden transition`}
              disabled={!snippetEnded || replayCount >= replayLimit}
              aria-disabled={!snippetEnded || replayCount >= replayLimit}
              aria-label={replayCount >= replayLimit ? 'Limite de repetições atingido' : `Reproduzir preview. Restam ${remainingReplays} de ${replayLimit}`}
            >
              <span className="relative z-10 flex items-center gap-1">
                <span className="text-xs">⟳</span>
                {replayCount >= replayLimit ? 'Sem replays' : 'Replay'}
                <span className="text-[9px] font-normal opacity-80">{remainingReplays}/{replayLimit}</span>
              </span>
              <span
                className="absolute inset-0 bg-black/5 dark:bg-white/5 pointer-events-none"
                style={{ maskImage: 'linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.4))' }}
              />
              <span
                className="absolute left-0 top-0 h-full bg-white/30 dark:bg-white/20 transition-[width]"
                style={{ width: `${Math.max(0, replayRatio) * 100}%` }}
                aria-hidden="true"
              />
            </button>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Replays usados {replayCount}</span>
          </div>
        </div>
      </form>
      <AnimatePresence>
        {feedback && !feedback.correta && (
          <_m.div
            key={feedback.titulo + 'erro'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-base font-semibold text-rose-600 dark:text-rose-400"
            aria-live="assertive"
          >
            Errou – {feedback.titulo}
          </_m.div>
        )}
      </AnimatePresence>
      {previousGuesses.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Palpites desta rodada</p>
          <ul className="flex flex-col gap-1 max-h-32 overflow-auto text-[11px] pr-1">
            {previousGuesses.map((g, i) => (
              <li key={i} className={`flex items-center gap-2 rounded px-2 py-1 border ${g.correta ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}> 
                <span className={`w-1.5 h-1.5 rounded-full ${g.correta ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-500'}`} />
                <span className="truncate flex-1">{g.texto}</span>
                {g.correta && g.matchType && <span className="text-[9px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{g.matchType}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <AnimatePresence>
        {pendingFinal && (
          <_m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-xl flex flex-col gap-4 backdrop-blur-md bg-white/55 dark:bg-black/35 z-20 border border-white/40 dark:border-white/10 p-5"
          >
            <_m.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="flex flex-col gap-3"
            >
              <h3 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 tracking-tight">Fim do Desafio</h3>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Pontuação</span>
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{finalScore ?? current.score}</span>
                </div>
                <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Rodadas</span>
                  <span className="text-lg font-semibold">{current.totalRounds}</span>
                </div>
                <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Acertos</span>
                  <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{acertos} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">/ {current.totalRounds}</span></span>
                </div>
                <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Erros</span>
                  <span className="text-lg font-semibold text-rose-600 dark:text-rose-400">{erros} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">/ {current.totalRounds}</span></span>
                </div>
                <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Aproveitamento</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{(acertos+erros) ? ((acertos/(acertos+erros))*100).toFixed(1) : '0.0'}% de {acertos+erros} tentativas</span>
                </div>
                {lastPoints && (
                  <div className="p-3 rounded-lg border border-emerald-500/30 dark:border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/10 backdrop-blur-sm flex flex-col gap-1 col-span-2">
                    <span className="text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Último Acerto</span>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex flex-wrap items-center gap-1">
                      +{lastPoints.pontosGanhos}
                      <span className="text-gray-400 dark:text-gray-500">=</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{lastPoints.pontosBase} base</span>
                      <span className="text-gray-400 dark:text-gray-500">+</span>
                      <span className="text-fuchsia-600 dark:text-fuchsia-400">{lastPoints.bonusTempo} bônus</span>
                    </span>
                  </div>
                )}
                {bestStreak > 0 && (
                  <div className="p-3 rounded-lg border border-amber-500/30 dark:border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/10 backdrop-blur-sm flex flex-col gap-1 col-span-2">
                    <span className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">Maior Streak</span>
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{bestStreak}x</span>
                  </div>
                )}
                <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Resumo Último Palpite</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{feedback?.correta ? 'Acerto' : 'Fim'} – {feedback?.titulo}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={restart} className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">Reiniciar</button>
                <button onClick={() => navigate('/jogar')} className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">Outro desafio</button>
                <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-medium shadow">Home</button>
              </div>
            </_m.div>
          </_m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
