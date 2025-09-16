import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// roles: array de tipos permitidos (ex: ['admin'])
export default function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth();

  if (loading) {
  return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Carregando...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const tipo = user?.tipo;
    if (!roles.includes(tipo)) {
      return <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-lg font-medium">Acesso negado</p>
  <p className="text-sm text-slate-500">Você não tem permissão para acessar esta página.</p>
      </div>;
    }
  }

  return children;
}