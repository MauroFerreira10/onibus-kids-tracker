import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      console.log('Protected route: no session, redirecting to login');
      navigate('/auth/login');
    }
  }, [session, navigate, isLoading]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando autenticação...</div>;
  }

  if (!session) {
    return <div className="flex items-center justify-center h-screen">Redirecionando...</div>;
  }

  return children;
}
