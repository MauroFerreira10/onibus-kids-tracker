import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import AnimatedBusScene from '@/components/auth/AnimatedBusScene';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [creatingDemoAccount, setCreatingDemoAccount] = useState(false);

  const createManagerAccount = async () => {
    try {
      setCreatingDemoAccount(true);
      
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: 'maurosawilala@gmail.com',
        password: '000000',
      });

      // If user exists, just sign in
      if (existingUser && existingUser.user) {
        // Verificar e atualizar o perfil se necessário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', existingUser.user.id)
          .single();

        if (profileError || !profileData || profileData.role !== 'manager') {
          // Atualizar ou criar o perfil
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: existingUser.user.id,
              name: 'Mauro Sawilala',
              role: 'manager',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (updateError) {
            console.error('Error updating profile:', updateError);
            toast.error('Erro ao atualizar perfil');
            return;
          }
        }

        toast.success('Login realizado com sucesso!');
        navigate('/manager/dashboard');
        return;
      }

      // Create the user if they don't exist
      const { data, error } = await supabase.auth.signUp({
        email: 'maurosawilala@gmail.com',
        password: '000000',
        options: {
          data: {
            name: 'Mauro Sawilala',
            role: 'manager'
          }
        }
      });

      if (error) {
        console.error('Error creating demo account:', error);
        toast.error('Erro ao criar conta de demonstração');
        return;
      }

      // Insert role in profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: 'Mauro Sawilala',
            role: 'manager',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('Erro ao criar perfil');
          return;
        }
        
        // Sign in with the new account
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: 'maurosawilala@gmail.com',
          password: '000000',
        });
        
        if (signInError) {
          toast.error('Erro ao fazer login com a conta criada');
        } else {
          toast.success('Conta de demonstração criada com sucesso!');
          navigate('/manager/dashboard');
        }
      }
    } catch (error) {
      console.error('Error in demo account creation:', error);
      toast.error('Erro ao criar conta de demonstração');
    } finally {
      setCreatingDemoAccount(false);
      setShowDemoDialog(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if this is the demo account
    if (email === 'maurosawilala@gmail.com' && password === '000000') {
      setShowDemoDialog(true);
      return;
    }
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
      } else {
        console.log('Login successful:', data);
        
        // Verificar o papel do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user role:', profileError);
          toast.success('Login realizado com sucesso!');
          navigate('/');
        } else {
          toast.success('Login realizado com sucesso!');
          
          // Direcionar com base no papel do usuário
          if (profileData.role === 'manager') {
            navigate('/manager/dashboard');
          } else if (profileData.role === 'driver') {
            navigate('/driver/dashboard');
          } else {
            navigate('/');
          }
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login" hideNavigation>
      <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-safebus-blue via-safebus-blue to-safebus-blue-dark">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FBBF24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-safebus-yellow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[500px] h-[500px] bg-safebus-yellow/5 rounded-full blur-3xl pointer-events-none" />
        {/* Animated bus scene */}
        <AnimatedBusScene />

        <div className="w-full max-w-md px-4 relative z-10 flex flex-col items-center py-6 no-scrollbar" style={{marginTop: '-10vh'}}>
          <div className="text-center mb-4">
            <img src="/safebus-logo.png" alt="SafeBus Logo" className="w-52 h-auto mx-auto mb-1 drop-shadow-2xl" />
            <p className="text-safebus-yellow font-orbitron text-lg tracking-widest font-bold">Segurança em cada trajeto</p>
          </div>
          <Card className="shadow-2xl border-0 bg-white w-full">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center text-safebus-blue font-bold">Entrar</CardTitle>
              <CardDescription className="text-center text-gray-500">
                Acesse a sua conta SafeBus
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-safebus-blue font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-safebus-blue font-medium">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold py-3 shadow-lg shadow-safebus-yellow/30 transition-all"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <div className="text-center text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <Link to="/auth/register" className="text-safebus-blue hover:text-safebus-blue-light font-semibold">
                    Registrar
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <Dialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-safebus-blue">Conta de Demonstração</DialogTitle>
            <DialogDescription>
              Parece que você está tentando entrar com a conta de demonstração do gestor.
              Vamos criar essa conta para você automaticamente se ela ainda não existir.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDemoDialog(false)}
              className="border-gray-200 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={createManagerAccount}
              disabled={creatingDemoAccount}
              className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold"
            >
              {creatingDemoAccount ? "Criando..." : "Criar Conta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Login;
