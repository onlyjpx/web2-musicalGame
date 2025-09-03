import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDesafios } from '../hooks/useDesafios';
import { useMusicasDesafio } from '../hooks/useMusicasDesafio';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircleIcon } from 'lucide-react';
import DesafioCreateForm from '../components/admin/DesafioCreateForm';
import DesafioItem from '../components/admin/DesafioItem';
import ConfirmDialog from '../components/reusable/ConfirmDialog';

export default function AdminHome() {
	const { user } = useAuth();
	const { desafios, loading: carregandoLista, erro: erroLista, carregar, criar, atualizar, remover, setDesafios } = useDesafios();
	const [dialog, setDialog] = useState({ open: false, id: null, titulo: '', loading: false });
	function updateMusicasCount(desafioId, count) {
		setDesafios(prev => prev.map(d => d.id === desafioId ? { ...d, musicasCount: count } : d));
	}
	const { musicas, toggle: toggleMusicas, handleFormChange: handleMusicaChange, adicionar: adicionarMusica, remover: removerMusica, selecionarSugestao, limparSelecao } = useMusicasDesafio({ onUpdateMusicasCount: updateMusicasCount });
    const navigate = useNavigate();

	useEffect(() => { carregar(); }, [carregar]);

	function afterAddMusica(desafioId) {
		// count será atualizado via callback do hook; fallback incremental se ausente
		setDesafios(prev => prev.map(d => d.id === desafioId ? { ...d, musicasCount: (d.musicasCount||0)+1 } : d));
	}

	const solicitarExclusao = useCallback((d) => {
		setDialog({ open: true, id: d.id, titulo: d.titulo, loading: false });
	}, []);

	const cancelarDialog = useCallback(() => setDialog(prev => ({ ...prev, open: false })), []);

	const confirmarExclusao = useCallback(async () => {
		setDialog(prev => ({ ...prev, loading: true }));
		try {
			await remover(dialog.id);
			setDialog({ open: false, id: null, titulo: '', loading: false });
		} catch {
			setDialog(prev => ({ ...prev, loading: false }));
		}
	}, [dialog.id, remover]);

	if (user?.tipo !== 'admin') {
		return <div className="max-w-3xl mx-auto px-4 py-10"><p className="text-red-600">Acesso negado.</p></div>;
	}

	return (
		<div className="relative min-h-screen px-5 py-20 flex flex-col items-center gap-12 bg-gradient-to-b from-white via-slate-50 to-white dark:from-black dark:via-zinc-950 dark:to-black overflow-hidden">
			{/* Decorative background (no overflow clipping) */}
			<div className="pointer-events-none select-none absolute inset-0">
				<div className="absolute -top-28 -left-32 w-72 h-72 bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 blur-3xl rounded-full" />
				<div className="absolute top-1/3 right-0 w-56 h-56 bg-gradient-to-br from-sky-400/25 to-emerald-400/25 blur-2xl rounded-full translate-x-1/4" />
			</div>
			<header className="relative z-10 flex flex-col gap-4 items-center text-center max-w-3xl">
				<div className="flex items-center gap-3">
					<button
						onClick={() => navigate(-1)}
						className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-full p-2 transition shadow-sm"
						aria-label="Voltar"
					>
						<ArrowLeftCircleIcon className="w-5 h-5" />
					</button>
					<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">Administração</h1>
				</div>
				<p className="text-sm text-gray-600 dark:text-gray-400">Logado como: <span className="font-medium">{user?.email}</span></p>
			</header>
			<main className="relative z-10 flex flex-col items-stretch gap-12 w-full max-w-4xl">
				{/* Form Panel */}
				<div className="flex flex-col gap-4">
					<div className="rounded-2xl p-8 backdrop-blur bg-white/85 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-sm">
						<h2 className="text-xl font-semibold mb-5 flex items-center gap-2"><span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-fuchsia-500 rounded-full" />Novo Desafio</h2>
						<DesafioCreateForm onCreate={criar} />
					</div>
					<p className="text-[11px] text-gray-600 dark:text-gray-500 leading-relaxed px-1">Cadastre um desafio; em seguida expanda para adicionar músicas (com prévia) ou editar dados.</p>
				</div>
				{/* List Panel */}
				<div className="flex flex-col gap-6">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500">Desafios</h2>
						<button onClick={carregar} disabled={carregandoLista} className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow disabled:opacity-50">{carregandoLista ? 'Atualizando...' : 'Recarregar'}</button>
					</div>
					<div className="rounded-2xl p-6 backdrop-blur bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[200px]">
						{erroLista && <div className="text-sm text-red-600 dark:text-red-400 mb-4">{erroLista}</div>}
						{carregandoLista && <div className="text-sm text-gray-500 dark:text-gray-400">Carregando...</div>}
						{!carregandoLista && desafios.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">Nenhum desafio ainda.</div>}
						<ul className="flex flex-col gap-5 mt-2">
							{desafios.map(d => (
								<DesafioItem
									key={d.id}
									d={d}
									musicaState={musicas[d.id]}
									onToggleMusicas={toggleMusicas}
									onAddMusica={(id, cb, deezerId) => adicionarMusica(id, () => { afterAddMusica(id); cb && cb(); }, deezerId)}
									onFormMusicaChange={handleMusicaChange}
									onUpdate={atualizar}
									onDelete={() => solicitarExclusao(d)}
									onAddMusicaCount={afterAddMusica}
									onRemoveMusica={(desafioId, musica)=> removerMusica(desafioId, musica)}
									onSelecionarSugestao={(id, s)=> selecionarSugestao(id, s)}
									onLimparSelecao={(id)=> limparSelecao(id)}
								/>
							))}
						</ul>
					</div>
				</div>
			</main>
			<ConfirmDialog
				open={dialog.open}
				title="Excluir desafio"
				message={`Tem certeza que deseja excluir o desafio:\n"${dialog.titulo}"? Essa ação não pode ser desfeita.`}
				confirmLabel={dialog.loading ? 'Excluindo...' : 'Excluir'}
				cancelLabel="Cancelar"
				onCancel={cancelarDialog}
				onConfirm={confirmarExclusao}
				confirming={dialog.loading}
			/>
		</div>
	);
}
