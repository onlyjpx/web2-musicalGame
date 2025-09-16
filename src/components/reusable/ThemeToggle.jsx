import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle({ className = '' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const label = theme === 'system' ? `Sistema (${resolvedTheme})` : (theme === 'dark' ? 'Escuro' : 'Claro');

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        title={`Tema: ${label}`}
        className="p-2 rounded-full bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-700 py-1 z-50">
          <button
            role="menuitem"
            onClick={() => { setTheme('light'); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-gray-700 ${theme==='light' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-gray-300'}`}
          >
            <Sun className="w-4 h-4" /> Claro
          </button>
          <button
            role="menuitem"
            onClick={() => { setTheme('dark'); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-gray-700 ${theme==='dark' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-gray-300'}`}
          >
            <Moon className="w-4 h-4" /> Escuro
          </button>
          <button
            role="menuitem"
            onClick={() => { setTheme('system'); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-gray-700 ${theme==='system' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-gray-300'}`}
          >
            <Monitor className="w-4 h-4" /> Sistema
          </button>
        </div>
      )}
    </div>
  );
}
