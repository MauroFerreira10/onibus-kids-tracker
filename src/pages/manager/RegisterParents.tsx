
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const parentSchema = z.object({
  name: z.string().min(3, "Nome precisa de pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
  childName: z.string().min(1, "Nome da criança é obrigatório"),
  childStudentNumber: z.string().min(1, "Número de estudante da criança é obrigatório"),
});

type ParentFormValues = z.infer<typeof parentSchema>;

const RegisterParents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      childName: '',
      childStudentNumber: '',
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

  const onSubmit = async (data: ParentFormValues) => {
    try {
      setLoading(true);
      
      // Registrar o responsável com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'parent',
          }
        }
      });

      if (authError) {
        console.error('Erro ao registrar responsável:', authError);
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
          role: 'parent',
          contact_number: data.phone,
          address: data.address,
        })
        .eq('id', authData.user.id);
        
      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        toast.error('Erro ao atualizar o perfil');
        return;
      }
      
      // Adicionar informações da criança
      const { error: childError } = await supabase
        .from('children')
        .insert({
          parent_id: authData.user.id,
          name: data.childName,
          student_number: data.childStudentNumber,
        });
        
      if (childError) {
        console.error('Erro ao adicionar informações da criança:', childError);
        toast.error('Erro ao adicionar informações da criança');
        return;
      }
      
      toast.success('Responsável registrado com sucesso!');
      form.reset();
    } catch (error) {
      console.error('Erro ao registrar responsável:', error);
      toast.error('Erro ao registrar responsável');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Registrar Responsáveis">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Registrar Responsáveis</h1>
          <Button variant="outline" onClick={() => navigate('/manager/dashboard')}>
            Voltar ao Painel
          </Button>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Adicionar Novo Responsável</CardTitle>
            <CardDescription>
              Preencha as informações do responsável e da criança
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-medium mb-4">Informações do Responsável</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do responsável" {...field} />
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
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Endereço completo" {...field} />
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
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Informações da Criança</h3>
                  
                  <FormField
                    control={form.control}
                    name="childName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Criança</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo da criança" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="childStudentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Estudante</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de identificação do estudante" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Registrando..." : "Registrar Responsável"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterParents;
