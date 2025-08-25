import { motion as _m } from 'motion/react';
import { useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import clsx from 'clsx';

/*
  Mudei o botão cesar:
  BotaoAnimado agora usa Tailwind para estilos.
  Props principais:
  - variantClasses: objeto com classes por estado { idle, loading, success, error }
  - baseClasses: classes comuns
  - mensagens / icones: personalização de conteúdo
  - autoResetMs: tempo para voltar a idle após success/error (opcional)
  - animateBackground: se true, mantém transição suave entre variantes
*/

export default function BotaoAnimado({
  mensagens = {
    idle: 'Enviar',
    loading: 'Processando...',
    success: 'Concluído!',
    error: 'Algo deu errado',
  },
  icones = {
    idle: null,
    loading: <Loader2 className="w-4 h-4 animate-spin" />,
    success: <Check className="w-4 h-4" />,
    error: <X className="w-4 h-4" />,
  },
  variantClasses = {
    idle: 'bg-blue-600 hover:bg-blue-500 text-white',
    loading: 'bg-blue-600 text-white opacity-90 cursor-wait',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    error: 'bg-red-600 hover:bg-red-500 text-white',
  },
  baseClasses = 'flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-colors',
  onClick,
  autoResetMs = 1800,
  animateBackground = false,
  className,
  disabled,
  state: controlledState, // quando passado, o botão vira controlado
  onStateChange,
}) {
  const [estado, setEstado] = useState('idle');

  async function handleClick(e) {
    if (disabled || estado === 'loading') return;
    if (!onClick) return;
    // Se for controlado, delega mudança
    if (controlledState !== undefined) {
      onStateChange?.('loading');
      try {
        await onClick(e);
        // Deixa componente pai definir quando vira success
      } catch {
        onStateChange?.('error');
      }
      return;
    }
    // Modo não controlado (interno)
    setEstado('loading');
    try {
      await onClick(e);
      setEstado('success');
      if (autoResetMs) setTimeout(() => setEstado('idle'), autoResetMs);
    } catch {
      setEstado('error');
      if (autoResetMs) setTimeout(() => setEstado('idle'), autoResetMs);
    }
  }

  const currentState = controlledState !== undefined ? controlledState : estado;
  const composed = clsx(baseClasses, variantClasses[currentState], className);

  return (
    <_m.button
      layout
      type="button"
      onClick={handleClick}
  disabled={disabled || currentState === 'loading'}
      className={composed}
      {...(animateBackground && { transition: { layout: { duration: 0.2 } } })}
      whileTap={{ scale: 0.97 }}
    >
      <_m.span layout="position" className="flex items-center gap-2">
  {icones[currentState]}
  {mensagens[currentState]}
      </_m.span>
    </_m.button>
  );
}
