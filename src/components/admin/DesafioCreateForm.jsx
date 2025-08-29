import { useState, useMemo } from 'react';
import BotaoAnimado from '../reusable/botaoAnimado';

export default function DesafioCreateForm({ onCreate }) {
  const [form, setForm] = useState({ titulo: '', genero: '', dificuldade: 'FACIL', desafioCapa: '' });
  const [state, setState] = useState('idle');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const capaPreview = useMemo(() => {
    if (!form.desafioCapa) return null;
    return /^https?:\/\//i.test(form.desafioCapa) ? form.desafioCapa : null;
  }, [form.desafioCapa]);

  function validar() {
    if (!form.titulo.trim()) return 'Título é obrigatório';
    if (!form.genero.trim()) return 'Gênero é obrigatório';
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    setErro(''); setMensagem('');
    const v = validar();
    if (v) { setErro(v); setState('error'); setTimeout(()=>setState('idle'), 1500); return; }
    setState('loading');
    try {
      await onCreate({ ...form, desafioCapa: form.desafioCapa || null });
      setMensagem('Desafio criado!');
      setState('success');
      setForm({ titulo: '', genero: '', dificuldade: 'FACIL', desafioCapa: '' });
      setTimeout(()=>setState('idle'), 1800);
    } catch (e) {
      setErro(e.message || 'Erro ao criar');
      setState('error');
      setTimeout(()=>setState('idle'), 2200);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="titulo">Título</label>
        <input id="titulo" value={form.titulo} onChange={e=> setForm(f=>({...f, titulo: e.target.value}))} className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Rock Clássico #1" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="genero">Gênero</label>
        <input id="genero" value={form.genero} onChange={e=> setForm(f=>({...f, genero: e.target.value}))} className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Rock" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="dificuldade">Dificuldade</label>
          <div className="select-wrapper">
            <select
              id="dificuldade"
              value={form.dificuldade}
              onChange={e=> setForm(f=>({...f, dificuldade: e.target.value}))}
              className="select-clean border border-gray-700 rounded p-2 w-full bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="FACIL">Fácil</option>
              <option value="MEDIO">Médio</option>
              <option value="DIFICIL">Difícil</option>
              <option value="MUITO_DIFICIL">Muito Difícil</option>
              <option value="EXTREMO">Extremo</option>
            </select>
          </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="desafioCapa">URL da Capa (opcional)</label>
        <input id="desafioCapa" value={form.desafioCapa} onChange={e=> setForm(f=>({...f, desafioCapa: e.target.value}))} className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://exemplo.com/imagem.jpg" />
        {capaPreview && (
          <div className="flex items-center gap-4">
            <img src={capaPreview} alt="Preview capa" className="h-20 w-20 object-cover rounded-lg border border-gray-300 dark:border-gray-700" />
            <button type="button" onClick={()=> setForm(f=>({...f, desafioCapa: ''}))} className="text-xs text-red-600 dark:text-red-400 hover:underline">Remover capa</button>
          </div>
        )}
      </div>
      {erro && <div className="text-sm text-red-600 dark:text-red-400" role="alert">{erro}</div>}
      {mensagem && <div className="text-sm text-green-600 dark:text-green-400" role="status">{mensagem}</div>}
      <BotaoAnimado
        state={state}
        onStateChange={setState}
        autoResetMs={null}
        buttonType="submit"
        onClick={null}
        mensagens={{ idle: 'Criar Desafio', loading: 'Salvando...', success: 'Criado!', error: 'Erro' }}
        variantClasses={{
          idle: 'bg-blue-600 hover:bg-blue-500 text-white',
          loading: 'bg-blue-600 text-white opacity-80 cursor-wait',
          success: 'bg-green-600 text-white hover:bg-green-500',
          error: 'bg-red-600 text-white hover:bg-red-500'
        }}
        baseClasses="w-full flex items-center justify-center gap-2 rounded-xl font-medium"
      />
    </form>
  );
}
