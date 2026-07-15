import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function SchoolAdminRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, isSchoolAdmin } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!session) {
        navigate('/auth/login');
      } else if (!isSchoolAdmin) {
        navigate('/');
      }
    }
  }, [session, isSchoolAdmin, authLoading, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!session) {
    return <div className="flex items-center justify-center h-screen">Redirecionando...</div>;
  }

  if (!isSchoolAdmin) {
    return <div className="flex items-center justify-center h-screen">Acesso negado. Apenas administradores escolares podem aceder a esta página.</div>;
  }

  return <>{children}</>;
}