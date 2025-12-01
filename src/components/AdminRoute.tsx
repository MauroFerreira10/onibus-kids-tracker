import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, isManager } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!session) {
        navigate('/auth/login');
      } else if (!isManager) {
        navigate('/');
      }
    }
  }, [session, isManager, authLoading, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!session) {
    return <div className="flex items-center justify-center h-screen">Redirecionando...</div>;
  }

  if (!isManager) {
    return <div className="flex items-center justify-center h-screen">Acesso negado. Apenas gestores podem acessar esta página.</div>;
  }

  return <>{children}</>;
}

