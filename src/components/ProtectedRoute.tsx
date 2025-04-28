
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      console.log('Protected route: no session, redirecting to login');
      navigate('/auth/login');
    }
  }, [session, navigate]);

  if (!session) {
    return <div className="flex items-center justify-center h-screen">Redirecionando...</div>;
  }

  return children;
}
