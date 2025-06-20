import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialCheckComplete, setIsInitialCheckComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthContext useEffect: running');

    const handleSession = async (currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession) {
        console.log('Session found or signed in');
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user role:', profileError);
            
            // Se o erro for porque o perfil não existe, vamos criá-lo
            if (profileError.code === 'PGRST116') {
              console.log('Perfil não encontrado. Criando novo perfil...');
              
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: currentSession.user.id,
                  name: currentSession.user.email?.split('@')[0] || 'Usuário',
                  role: 'parent', // Role padrão
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single();

              if (createError) {
                console.error('Erro ao criar perfil:', createError);
              } else {
                console.log('Perfil criado com sucesso:', newProfile);
                if (isInitialCheckComplete && window.location.pathname.includes('/auth/')) {
                  navigate('/');
                }
              }
            } else if (profileError.code === '406') {
              console.error('Erro de formato na requisição. Verificando cabeçalhos...');
              // Tentar novamente com cabeçalhos explícitos
              const { data: retryData, error: retryError } = await supabase
                .from('profiles')
                .select('id, name, role, contact_number, address, school_id, created_at, updated_at')
                .eq('id', currentSession.user.id)
                .single();
              
              if (retryError) {
                console.error('Erro na segunda tentativa:', retryError);
              } else {
                console.log('User role (segunda tentativa):', retryData.role);
                if (isInitialCheckComplete && window.location.pathname.includes('/auth/')) {
                  if (retryData.role === 'driver') {
                    navigate('/driver');
                  } else if (retryData.role === 'manager') {
                    navigate('/manager/dashboard');
                  } else {
                    navigate('/');
                  }
                }
              }
            }
          } else {
            console.log('User role:', profileData.role);
            if (isInitialCheckComplete && window.location.pathname.includes('/auth/')) {
              if (profileData.role === 'driver') {
                navigate('/driver');
              } else if (profileData.role === 'manager') {
                navigate('/manager/dashboard');
              } else {
                navigate('/');
              }
            }
          }
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
        }
      } else {
        console.log('No session');
        if (isInitialCheckComplete) {
          const path = window.location.pathname;
          if (!path.includes('/auth/')) {
            console.log('No session, redirecting to login');
            navigate('/auth/login');
          }
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth event:', event, 'isLoading (in listener):', isLoading);
        if (event !== 'INITIAL_SESSION') {
          handleSession(currentSession);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial getSession check done. isLoading (after getSession):', isLoading);
      handleSession(currentSession);
      setIsInitialCheckComplete(true);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, isInitialCheckComplete]);

  const signOut = async () => {
    console.log('Signing out');
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando autenticação inicial...</div>;
  }

  return (
    <AuthContext.Provider value={{ session, user, signOut, isLoading }}>
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
