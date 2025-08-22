import { motion as _m } from "motion/react";
import { Sun, Moon, User, LogIn, UserPlus, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { LoginGoogleCustom } from '../components/googleLogin'
import { Navigate } from 'react-router-dom'

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        setIsLoggedIn(true);
        setUserData(parsedToken);
      } catch {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserData(null);
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

  return (
    <div className={`${darkMode ? "dark bg-black text-white" : "bg-white text-black"} items-center justify-center min-h-screen`}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-bold text-xl">Music Guessr</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {userData?.nome || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Logado
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
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Entrar
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Registrar
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
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
        {[
          { titulo: "Desafios do Dia", desc: "Participe dos desafios diários." },
          { titulo: "Ranking Global", desc: "Veja quem está no topo." },
          { titulo: "Crie seu Desafio", desc: "Monte desafios para seus amigos." },
        ].map((card, i) => (
          <_m.div
            key={i}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-2xl shadow-md bg-gray-100 dark:bg-gray-900"
          >
            <h3 className="font-bold text-lg mb-2">{card.titulo}</h3>
            <p className="text-gray-600 dark:text-gray-400">{card.desc}</p>
          </_m.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2025 Guess The Song — Feito com ❤️</p>
      </footer>
    </div>
  );
}
