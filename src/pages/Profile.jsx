import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import BotaoAnimado from '../components/reusable/botaoAnimado';

export default function Profile() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [editPic, setEditPic] = useState(false);
  const [picUrl, setPicUrl] = useState('');
  const [savingPic, setSavingPic] = useState(false);
  const navigate = useNavigate();

  const carregar = useCallback(async () => {
    if (!user) return;
    setLoading(true); setErro('');
    try {
      const { data } = await api.get('/profile/me');
      setData(data);
    } catch (e) {
      setErro(e.response?.data?.error?.message || 'Falha ao carregar perfil');
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { carregar(); }, [carregar]);

  if (!user) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-sm text-red-600 dark:text-red-400">Faça login para ver seu perfil.</p></div>;
  }

  return (
    <div className="relative min-h-screen px-5 py-24 flex flex-col items-center gap-10 bg-gradient-to-b from-white via-slate-50 to-white dark:from-black dark:via-zinc-950 dark:to-black overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 w-80 h-80 bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/25 blur-3xl rounded-full" />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-to-br from-fuchsia-400/20 to-rose-400/20 blur-2xl rounded-full translate-x-1/4" />
      </div>
      <header className="relative z-10 flex flex-col items-center text-center gap-4">
        <div className="relative group">
          <img src={user.picture} alt="avatar" className="h-24 w-24 rounded-full ring-4 ring-indigo-500/40 object-cover shadow-lg" />
          <button
            type="button"
            onClick={() => { setEditPic(true); setPicUrl(user.picture || ''); }}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-semibold text-white tracking-wide transition"
          >Trocar</button>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">Perfil</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user.nome} • {user.email}</p>
        </div>
        <div className="flex gap-3">
            <button
                onClick={() => navigate(-1)}
                className = "border border-indigo-700 hover:bg-gray-800 font-bold rounded-2xl text-indigo-600 hover:text-white dark:text-indigo-400 px-4 py-2"
            >Voltar</button>
            <BotaoAnimado mensagens={{ idle: 'Recarregar', loading: 'Carregando...', success: 'Atualizado', error: 'Erro' }} onClick={carregar} className="!px-5 !py-2 text-xs" autoResetMs={1000} />
        </div>
        {erro && <p className="text-xs text-red-600 mt-1">{erro}</p>}
      </header>
      {editPic && (
        <div className="relative z-20 w-full max-w-sm mx-auto -mt-6">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 shadow flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Alterar Foto de Perfil</h3>
            <input
              type="text"
              value={picUrl}
              onChange={e=> setPicUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-1">Aceita http(s), data:image, blob:, ipfs:// ou caminho relativo.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={()=> setEditPic(false)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700">Cancelar</button>
              <button
                type="button"
                disabled={!picUrl.trim() || savingPic}
                onClick={async ()=> {
                  if (!picUrl.trim()) return;
                  setSavingPic(true);
                  setErro('');
                  try {
                    const { data: resp } = await api.put('/profile/picture', { picture: picUrl.trim() });
                    // Atualiza Auth user e dados locais
                    user.picture = resp.usuario.picture; // mutate local
                    setEditPic(false);
                    carregar();
                  } catch (e) {
                    setErro(e.response?.data?.error?.message || 'Falha ao atualizar foto');
                  } finally { setSavingPic(false); }
                }}
                className="px-4 py-1.5 text-xs rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-medium disabled:opacity-50"
              >{savingPic ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
      <main className="relative z-10 w-full max-w-5xl flex flex-col gap-10">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading && !data && <div className="col-span-full text-center text-xs text-gray-500">Carregando...</div>}
          {data && (
            <>
              <CardMetric titulo="Tentativas" valor={data.stats.totalTentativas} />
              <CardMetric titulo="Acertos" valor={data.stats.acertos} />
              <CardMetric titulo="Taxa de Acerto" valor={`${data.stats.taxaAcerto}%`} />
              <CardMetric titulo="Pontos Totais" valor={data.stats.pontosTotais} />
              <CardMetric titulo="Média Tempo (s)" valor={data.stats.mediaTempoResposta ?? '—'} />
            </>
          )}
        </section>
        {data && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500">Por Dificuldade</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {Object.entries(data.stats.porDificuldade).map(([dif, s]) => (
                <div key={dif} className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 backdrop-blur flex flex-col gap-1 text-xs">
                  <span className="font-semibold">{dif}</span>
                  <span className="text-gray-500 dark:text-gray-400">Tentativas: {s.tentativas}</span>
                  <span className="text-gray-500 dark:text-gray-400">Pontos: {s.pontos}</span>
                </div>
              ))}
              {Object.keys(data.stats.porDificuldade).length === 0 && <p className="text-xs text-gray-500">Sem dados ainda.</p>}
            </div>
          </section>
        )}
        {data && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500">Últimas Tentativas</h2>
            {data.recentes.length === 0 && <p className="text-xs text-gray-500">Sem tentativas ainda.</p>}
            <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
              {data.recentes.map(t => (
                <li key={t.id} className="px-4 py-3 flex items-center gap-4 text-xs">
                  <span className={`w-2 h-2 rounded-full ${t.acertou ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate font-medium">{t.desafio.titulo}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{t.desafio.dificuldade}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`font-semibold ${t.acertou ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{t.acertou ? 'Acerto' : 'Erro'}</span>
                    <span className="text-gray-600 dark:text-gray-400">{t.pontos} pts</span>
                    <span className="text-gray-400 dark:text-gray-500 tabular-nums">{t.tempoResposta != null ? `${t.tempoResposta.toFixed(2)}s` : '—'}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function CardMetric({ titulo, valor }) {
  return (
    <div className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 backdrop-blur flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{titulo}</span>
      <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500">{valor}</span>
    </div>
  );
}