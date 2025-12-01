import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function DriverRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, isDriver } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!session) {
        navigate('/auth/login');
      } else if (!isDriver) {
        navigate('/');
      }
    }
  }, [session, isDriver, authLoading, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!session) {
    return <div className="flex items-center justify-center h-screen">Redirecionando...</div>;
  }

  if (!isDriver) {
    return <div className="flex items-center justify-center h-screen">Acesso negado. Apenas motoristas podem acessar esta página.</div>;
  }

  return <>{children}</>;
}

