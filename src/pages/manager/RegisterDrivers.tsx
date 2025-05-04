
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Invitation } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Share2, Copy, CheckCircle, Mail, Key } from 'lucide-react';

const driverSchema = z.object({
  name: z.string().min(3, "Nome precisa de pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
});

type DriverFormValues = z.infer<typeof driverSchema>;

const RegisterDrivers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [generatedInvitation, setGeneratedInvitation] = useState<Invitation | null>(null);
  
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    }
  });

  useEffect(() => {
    checkManagerRole();
  }, []);

  const checkManagerRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        navigate('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data.role !== 'manager') {
        toast.error('Acesso restrito a gestores');
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      toast.error('Erro ao verificar permissões');
      navigate('/');
    }
  };

  // Gerar código de ativação
  const generateActivationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateDriverCode = async (email: string | null = null) => {
    try {
      setGeneratingCode(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return null;
      }
      
      const activationCode = generateActivationCode();
      const baseUrl = window.location.origin;
      
      // Criar novo convite
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          role: 'driver',
          email: email,
          activation_code: activationCode,
          created_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias de validade
          used: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Gerar URL para compartilhamento
      const shareUrl = `${baseUrl}/auth/register?role=driver&code=${activationCode}`;
      
      setGeneratedCode(activationCode);
      setShareUrl(shareUrl);
      setGeneratedInvitation(data as Invitation);
      toast.success('Código de motorista gerado com sucesso!');
      
      return { code: activationCode, url: shareUrl, invitation: data };
    } catch (error) {
      console.error('Erro ao gerar código de motorista:', error);
      toast.error('Erro ao gerar código de motorista');
      return null;
    } finally {
      setGeneratingCode(false);
    }
  };

  const onSubmit = async (data: DriverFormValues) => {
    try {
      setLoading(true);
      
      // Registrar o motorista com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'driver',
          }
        }
      });

      if (authError) {
        console.error('Erro ao registrar motorista:', authError);
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar o usuário');
        return;
      }
      
      // Atualizar perfil com informações adicionais
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          role: 'driver',
          contact_number: data.phone,
        })
        .eq('id', authData.user.id);
        
      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        toast.error('Erro ao atualizar o perfil');
        return;
      }
      
      toast.success('Motorista registrado com sucesso!');
      form.reset();
    } catch (error) {
      console.error('Erro ao registrar motorista:', error);
      toast.error('Erro ao registrar motorista');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailInvitation = async () => {
    if (!generatedInvitation || !generatedInvitation.email) {
      toast.error('É necessário gerar um código com email primeiro');
      return;
    }
    
    try {
      setLoading(true);
      
      // Simular envio de email (aqui você implementaria a lógica real de envio)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Convite enviado para ${generatedInvitation.email}`);
    } catch (error) {
      console.error('Erro ao enviar convite por email:', error);
      toast.error('Erro ao enviar convite por email');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } else {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
    toast.success(`${type === 'url' ? 'Link' : 'Código'} copiado para a área de transferência`);
  };

  const handleQuickCodeGeneration = async () => {
    await generateDriverCode(null);
  };

  const handleEmailCodeGeneration = async () => {
    const email = prompt('Digite o email do motorista:');
    if (!email) return;
    
    // Validar email
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Email inválido');
      return;
    }
    
    await generateDriverCode(email);
  };

  return (
    <Layout title="Registrar Motoristas">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Registrar Motoristas</h1>
          <Button variant="outline" onClick={() => navigate('/manager/dashboard')}>
            Voltar ao Painel
          </Button>
        </div>
        
        <Tabs defaultValue="code" className="max-w-2xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="code">Gerar Código de Convite</TabsTrigger>
            <TabsTrigger value="form">Registrar Diretamente</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code">
            <Card>
              <CardHeader>
                <CardTitle>Código de Convite para Motoristas</CardTitle>
                <CardDescription>
                  Gere um código de convite para os motoristas se registrarem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generatedCode ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Button 
                        onClick={handleQuickCodeGeneration}
                        disabled={generatingCode} 
                        className="h-24 flex flex-col items-center justify-center"
                      >
                        <Key className="h-6 w-6 mb-2" />
                        <span>Gerar Código Rápido</span>
                      </Button>
                      <Button 
                        onClick={handleEmailCodeGeneration}
                        disabled={generatingCode} 
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center"
                      >
                        <Mail className="h-6 w-6 mb-2" />
                        <span>Gerar Código com Email</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Código de Ativação:</h4>
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold tracking-wider">{generatedCode}</div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedCode, 'code')}>
                          {codeCopied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        O código é válido por 7 dias e pode ser usado apenas uma vez.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Link de Convite:</h4>
                      <div className="flex items-center justify-between p-2 bg-muted rounded-md overflow-x-auto">
                        <div className="text-sm text-muted-foreground">{shareUrl}</div>
                        <Button variant="ghost" size="sm" onClick={() => shareUrl && copyToClipboard(shareUrl, 'url')}>
                          {urlCopied ? <CheckCircle className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    {generatedInvitation?.email && (
                      <div className="pt-4">
                        <Button 
                          onClick={sendEmailInvitation}
                          disabled={loading} 
                          className="w-full"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Convite por Email
                        </Button>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setGeneratedCode(null);
                        setShareUrl(null);
                        setGeneratedInvitation(null);
                      }}
                      className="w-full"
                    >
                      Gerar Novo Código
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Compartilhe o código ou link gerado com o motorista para que ele possa se registrar.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Motorista</CardTitle>
                <CardDescription>
                  Preencha as informações do motorista para criar uma conta diretamente
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do motorista" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Senha de acesso" {...field} />
                          </FormControl>
                          <FormDescription>
                            A senha deve ter pelo menos 6 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Registrando..." : "Registrar Motorista"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default RegisterDrivers;
