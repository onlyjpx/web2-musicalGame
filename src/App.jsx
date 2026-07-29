import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registrar from "./pages/Resgistrar";
import AdminHome from './pages/adminHome.jsx';
import PlayDesafio from './pages/PlayDesafio.jsx';
import GameSelect from './pages/GameSelect.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Profile from './pages/Profile.jsx';
import Ranking from './pages/Ranking.jsx';
import { playClickSfx } from './utils/sfx.js';

export default function App() {
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.closest('button')) playClickSfx();
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminHome /></ProtectedRoute>} />
        <Route path="/jogar" element={<ProtectedRoute roles={['admin','usuario']}><GameSelect /></ProtectedRoute>} />
        <Route path="/play/:id" element={<ProtectedRoute roles={['admin','usuario']}><PlayDesafio /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute roles={['admin','usuario']}><Profile /></ProtectedRoute>} />
  <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </BrowserRouter>
  );
}
