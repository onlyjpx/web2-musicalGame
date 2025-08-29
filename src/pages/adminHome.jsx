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
	const { musicas, toggle: toggleMusicas, handleFormChange: handleMusicaChange, adicionar: adicionarMusica, remover: removerMusica } = useMusicasDesafio({ onUpdateMusicasCount: updateMusicasCount });
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
		<div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-12">
			<section>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-transparent hover:bg-indigo-950 border rounded-4xl text-sm text-blue-600"
                ><ArrowLeftCircleIcon /></button>
				<h1 className="text-3xl font-bold mb-2">Admin - Criar Desafios</h1>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Logado como: <span className="font-medium">{user?.email}</span></p>
				<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
					<DesafioCreateForm onCreate={criar} />
				</div>
			</section>

			<section className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold">Desafios</h2>
					<button onClick={carregar} className="text-sm text-blue-600 hover:underline disabled:opacity-50" disabled={carregandoLista}>Recarregar</button>
				</div>
				{erroLista && <div className="text-sm text-red-600">{erroLista}</div>}
				{carregandoLista && <div className="text-sm text-gray-500">Carregando...</div>}
				{!carregandoLista && desafios.length === 0 && <div className="text-sm text-gray-500">Nenhum desafio.</div>}
				<ul className="flex flex-col gap-4">
					{desafios.map(d => (
						<DesafioItem
							key={d.id}
							d={d}
							musicaState={musicas[d.id]}
							onToggleMusicas={toggleMusicas}
							onAddMusica={(id, cb) => adicionarMusica(id, () => { afterAddMusica(id); cb && cb(); })}
							onFormMusicaChange={handleMusicaChange}
							onUpdate={atualizar}
							onDelete={() => solicitarExclusao(d)}
							onAddMusicaCount={afterAddMusica}
							onRemoveMusica={(desafioId, musica)=> removerMusica(desafioId, musica)}
						/>
					))}
				</ul>
			</section>
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
