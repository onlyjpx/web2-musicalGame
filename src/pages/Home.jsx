import { motion as _m } from "motion/react";
import { Sun, Moon, User, LogIn, UserPlus, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { LoginGoogleCustom } from '../components/googleLogin'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Home() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, token, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Dados das seções principais + detalhes
  const features = [
    {
      key: 'desafios',
      titulo: 'Desafios do Dia',
      desc: 'Participe dos desafios diários.',
      detalhe: 'Todo dia novos trechos de músicas são liberados. Você tem tentativas limitadas para adivinhar antes que mais segundos da faixa sejam revelados.'
    },
    {
      key: 'ranking',
      titulo: 'Ranking Global',
      desc: 'Veja quem está no topo.',
      detalhe: 'O ranking soma sua pontuação baseada em acertos rápidos e streaks. Suba de posição jogando diariamente e mantendo uma sequência.'
    },
    {
      key: 'criar',
      titulo: 'Crie seu Desafio',
      desc: 'Monte desafios para seus amigos.',
      detalhe: 'Selecione músicas, defina dicas e compartilhe um link para amigos competirem entre si em tempo real.'
    },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
  <div className={`${resolvedTheme === 'dark' ? 'dark bg-black text-white' : 'bg-white text-black'} items-center justify-center min-h-screen`}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-bold text-xl">Music Guessr</h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme}>
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative user-menu">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
              
              {showUserMenu && (
                <_m.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                >
      {token ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
        {user?.nome || user?.email || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
        {loading ? 'Carregando...' : 'Logado'}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => navigate('/login')}
                      >
                        <LogIn className="w-4 h-4" />
                        Entrar
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Registrar
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 m-3 p-2">
                        <LoginGoogleCustom />
                      </div>
                    </>
                  )}
                </_m.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <_m.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-4"
        >
          Adivinhe a música 🎧
        </_m.h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Teste seus conhecimentos musicais e desafie seus amigos!
        </p>
        <_m.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-2xl font-semibold shadow-md bg-blue-600 text-white"
        >
          Jogar Agora
        </_m.button>
      </section>

      {/* Cards */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((card) => (
          <_m.button
            key={card.key}
            onClick={() => scrollTo(`sec-${card.key}`)}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-left p-6 rounded-2xl shadow-md bg-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span>{card.titulo}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600 text-white">ver mais</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{card.desc}</p>
          </_m.button>
        ))}
      </section>

      {/* Seções detalhadas */}
      <section className="max-w-5xl mx-auto px-4 pb-32 flex flex-col gap-24">
        {features.map(card => (
          <div
            key={card.key}
            id={`sec-${card.key}`}
            className="scroll-mt-32"
          >
            <_m.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -80px 0px' }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold mb-3"
            >
              {card.titulo}
            </_m.h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 max-w-3xl">
              {card.detalhe}
            </p>
            <button
              onClick={() => scrollTo('top')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Voltar ao topo ↑
            </button>
          </div>
        ))}
      </section>

      {/* Footer */}
  <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2025 Guess The Song — Feito com ❤️</p>
      </footer>
    </div>
  );
}
