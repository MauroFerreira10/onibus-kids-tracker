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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Student { id: string; name: string; student_number: string; }

const parentSchema = z.object({
  name: z.string().min(3, "Nome precisa de pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
  childStudentId: z.string().min(1, "Selecione o aluno"),
});

type ParentFormValues = z.infer<typeof parentSchema>;

const RegisterParents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      childStudentId: '',
    }
  });

  useEffect(() => {
    checkManagerRole();
    loadStudents();
  }, []);

  const checkManagerRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth/login'); return; }
      const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (error || data.role !== 'manager') {
        toast.error('Acesso restrito a gestores');
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  };

  const loadStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('id, name, student_number')
      .order('name');
    if (data) setStudents(data);
  };

  const onSubmit = async (data: ParentFormValues) => {
    setLoading(true);
    let createdUserId: string | null = null;

    try {
      const selectedStudent = students.find(s => s.id === data.childStudentId);
      if (!selectedStudent) throw new Error('Aluno não encontrado');

      // 1. Criar conta Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name, role: 'parent' } }
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Erro ao criar utilizador');

      createdUserId = authData.user.id;

      // 2. Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          role: 'parent',
          contact_number: data.phone,
          address: data.address,
        })
        .eq('id', createdUserId);

      if (profileError) throw new Error('Erro ao atualizar perfil: ' + profileError.message);

      // 3. Ligar responsável ao aluno
      const { error: childError } = await supabase
        .from('children')
        .insert({
          parent_id: createdUserId,
          name: selectedStudent.name,
          student_number: selectedStudent.student_number,
        });

      if (childError) throw new Error('Erro ao associar aluno: ' + childError.message);

      toast.success('Responsável registado com sucesso!');
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registar responsável.');
      if (createdUserId) {
        toast.warning('Conta Auth criada mas registo incompleto. Contacte o suporte se o problema persistir.');
      }
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
              Preencha as informações do responsável e selecione o aluno associado
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-medium mb-4">Informações do Responsável</h3>

                  <div className="space-y-4">
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
                            <Input placeholder="+244 900 000 000" {...field} />
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
                          <FormDescription>A senha deve ter pelo menos 6 caracteres</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Aluno Associado</h3>

                  <FormField
                    control={form.control}
                    name="childStudentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selecione o Aluno</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={students.length ? "Selecione o aluno" : "Nenhum aluno registado"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map(s => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} — Nº {s.student_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-safebus-blue hover:bg-safebus-blue/90"
                >
                  {loading ? "A registar..." : "Registar Responsável"}
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
