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
import logo from '@/assets/logo.svg';

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
      <div 
        className="min-h-screen flex items-center justify-center overflow-y-auto py-8 relative"
        style={{
          backgroundImage: 'url("/lubango_bus.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="w-full max-w-md px-4 relative z-10">
          <div className="text-center mb-8">
            <img src={logo} alt="SafeBus Logo" className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">SafeBus</h1>
            <p className="text-white/90">Sua segurança é nossa prioridade</p>
          </div>
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">Login</CardTitle>
              <CardDescription className="text-center text-white/90">
                Entre com sua conta para acessar o sistema
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium py-2.5" 
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <div className="text-center text-sm text-gray-600 mt-4">
                  Não tem uma conta?{" "}
                  <Link to="/auth/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
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
            <DialogTitle>Conta de Demonstração</DialogTitle>
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
              className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white"
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
