
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
        toast.success('Login realizado com sucesso!');
        navigate('/manager/dashboard');
        return;
      }

      // Create the user if they don't exist
      const { data, error } = await supabase.auth.signUp({
        email: 'maurosawilala@gmail.com',
        password: '000000',
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
          .update({ role: 'manager' })
          .eq('id', data.user.id);
        
        if (profileError) {
          console.error('Error updating profile:', profileError);
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
            navigate('/driver');
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
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Login</CardTitle>
              <CardDescription className="text-center">
                Entre com sua conta para acessar o sistema
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <div className="text-center text-sm">
                  Não tem uma conta?{" "}
                  <Link to="/auth/register" className="text-busapp-primary hover:underline">
                    Registrar
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      
      <Dialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conta de Demonstração</DialogTitle>
            <DialogDescription>
              Parece que você está tentando entrar com a conta de demonstração do gestor.
              Vamos criar essa conta para você automaticamente se ela ainda não existir.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDemoDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={createManagerAccount} 
              disabled={creatingDemoAccount}
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
