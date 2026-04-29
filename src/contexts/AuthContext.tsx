import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'parent' | 'driver' | 'manager';
  contact_number?: string;
  address?: string;
  school_id?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  // Evita fetch duplicado de profile em re-renders
  const fetchingProfileRef = useRef<string | null>(null);

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    if (fetchingProfileRef.current === userId) return null;
    fetchingProfileRef.current = userId;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, contact_number, address, school_id')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Perfil não existe, cria com role padrão
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              name: 'Usuário',
              role: 'parent',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id, name, role, contact_number, address, school_id')
            .single();
          return newProfile as UserProfile | null;
        }
        return null;
      }
      return data as UserProfile;
    } finally {
      fetchingProfileRef.current = null;
    }
  };

  const handleSession = async (currentSession: Session | null, redirect = false) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    if (currentSession) {
      const userProfile = await fetchProfile(currentSession.user.id);
      setProfile(userProfile);

      if (redirect && window.location.pathname.includes('/auth/')) {
        const role = userProfile?.role;
        if (role === 'driver') navigate('/driver/dashboard');
        else if (role === 'manager') navigate('/manager/dashboard');
        else navigate('/');
      }
    } else {
      setProfile(null);
      const path = window.location.pathname;
      if (!path.includes('/auth/')) {
        navigate('/auth/login');
      }
    }
  };

  useEffect(() => {
    // Verifica sessão inicial — UMA única vez
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      handleSession(currentSession, false).finally(() => setIsLoading(false));
    });

    // Escuta mudanças de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'SIGNED_IN') {
          handleSession(currentSession, true);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          navigate('/auth/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
