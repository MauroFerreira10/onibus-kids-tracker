import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const studentSchema = z.object({
  name: z.string().min(3, "Nome precisa de pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  studentNumber: z.string().min(1, "Número de estudante é obrigatório"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
  address: z.string().optional(),
  phoneNumber: z.string().optional()
});

type StudentFormValues = z.infer<typeof studentSchema>;

const RegisterStudents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      studentNumber: '',
      password: '',
      address: '',
      phoneNumber: ''
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

  const onSubmit = async (data: StudentFormValues) => {
    try {
      setLoading(true);
      
      console.log('Dados do formulário:', data); // Log para debug
      
      // Registrar o aluno com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'student'
          }
        }
      });

      if (authError) {
        console.error('Erro detalhado ao registrar aluno:', authError);
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        console.error('Nenhum usuário retornado após registro');
        toast.error('Erro ao criar o usuário');
        return;
      }

      const userId = authData.user.id;
      console.log('Usuário criado com sucesso:', userId);

      // Atualizar o perfil existente
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email: data.email,
          name: data.name,
          role: 'student',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        console.error('Erro detalhado ao atualizar perfil:', profileError);
        toast.error('Erro ao atualizar o perfil: ' + profileError.message);
        return;
      }

      console.log('Perfil atualizado com sucesso');

      // Criar registro na tabela students com todos os dados
      const studentDataToInsert = {
        id: userId,
        name: data.name,
        student_number: data.studentNumber,
        email: data.email,
        pickup_address: data.address || null,
        phone_number: data.phoneNumber || null,
        created_at: new Date().toISOString()
      };

      console.log('Dados a serem inseridos na tabela students:', studentDataToInsert);

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert(studentDataToInsert)
        .select()
        .single();

      if (studentError) {
        console.error('Erro detalhado ao criar registro do aluno:', studentError);
        toast.error('Erro ao criar registro do aluno: ' + studentError.message);
        return;
      }

      if (!studentData) {
        console.error('Nenhum dado retornado após criar registro do aluno');
        toast.error('Erro ao confirmar registro do aluno');
        return;
      }

      console.log('Registro do aluno criado com sucesso:', studentData);
      
      toast.success('Aluno registrado com sucesso!');
      form.reset();
    } catch (error) {
      console.error('Erro completo ao registrar aluno:', error);
      toast.error('Erro ao registrar aluno. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Registrar Alunos">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Registrar Alunos</h1>
          <Button variant="outline" onClick={() => navigate('/manager/dashboard')}>
            Voltar ao Painel
          </Button>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Adicionar Novo Aluno</CardTitle>
            <CardDescription>
              Preencha as informações do aluno para criar uma conta
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
                        <Input placeholder="Nome do aluno" {...field} />
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
                  name="studentNumber"
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
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço do aluno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Telemóvel</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de telemóvel do aluno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Registrando..." : "Registrar Aluno"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterStudents;
