import { useEffect, useRef } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';

export default function ConfirmDialog({ open, title='Confirmar', message, confirmLabel='Confirmar', cancelLabel='Cancelar', onConfirm, onCancel, confirming }) {
  const ref = useRef(null);
  useEffect(()=> {
    if (open) {
      const prev = document.activeElement;
      ref.current?.focus();
      function handleKey(e){ if(e.key==='Escape') onCancel(); }
      window.addEventListener('keydown', handleKey);
      return ()=> { window.removeEventListener('keydown', handleKey); prev && prev.focus?.(); };
    }
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Motion.button
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <Motion.div
            role="dialog" aria-modal="true"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, mass: 0.6 }}
            className="relative w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-5"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button ref={ref} onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">{cancelLabel}</button>
              <button disabled={confirming} onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500">
                {confirming && <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
