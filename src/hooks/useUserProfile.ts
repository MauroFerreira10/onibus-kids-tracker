import { useAuth } from '@/contexts/AuthContext';

// Usa o profile já carregado no AuthContext — sem fetch adicional
export const useUserProfile = () => {
  const { profile, isLoading } = useAuth();

  return {
    profile,
    isLoading,
    error: null,
    isStudent: profile?.role === 'student',
    isParent: profile?.role === 'parent',
    isDriver: profile?.role === 'driver',
    isManager: profile?.role === 'manager',
  };
};

