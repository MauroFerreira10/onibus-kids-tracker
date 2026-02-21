import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'parent' | 'driver' | 'manager';
  contact_number?: string;
  address?: string;
  school_id?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, role, contact_number, address, school_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setError('Erro ao carregar perfil do usuário');
          setProfile(null);
        } else {
          setProfile(data as UserProfile);
        }
      } catch (err) {
        console.error('Error in useUserProfile:', err);
        setError('Erro ao carregar perfil');
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return {
    profile,
    isLoading,
    error,
    isStudent: profile?.role === 'student',
    isParent: profile?.role === 'parent',
    isDriver: profile?.role === 'driver',
    isManager: profile?.role === 'manager',
  };
};

