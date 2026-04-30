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

interface Route { id: string; name: string; }
interface Stop { id: string; name: string; route_id: string; }

const studentSchema = z.object({
  name: z.string().min(3, "Nome precisa de pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  studentNumber: z.string().min(1, "Número de estudante é obrigatório"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  routeId: z.string().min(1, "Selecione uma rota"),
  stopId: z.string().min(1, "Selecione uma paragem"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const RegisterStudents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      studentNumber: '',
      password: '',
      address: '',
      phoneNumber: '',
      routeId: '',
      stopId: '',
    }
  });

  const selectedRouteId = form.watch('routeId');

  useEffect(() => {
    checkManagerRole();
    loadRoutesAndStops();
  }, []);

  useEffect(() => {
    setFilteredStops(stops.filter(s => s.route_id === selectedRouteId));
    form.setValue('stopId', '');
  }, [selectedRouteId, stops]);

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

  const loadRoutesAndStops = async () => {
    const [{ data: routesData }, { data: stopsData }] = await Promise.all([
      supabase.from('routes').select('id, name').order('name'),
      supabase.from('stops').select('id, name, route_id').order('sequence_number', { ascending: true }),
    ]);
    if (routesData) setRoutes(routesData);
    if (stopsData) setStops(stopsData);
  };

  const onSubmit = async (data: StudentFormValues) => {
    setLoading(true);
    let createdUserId: string | null = null;

    try {
      // 1. Criar conta Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name, role: 'student' } }
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Erro ao criar utilizador');

      createdUserId = authData.user.id;

      // 2. Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          role: 'student',
          contact_number: data.phoneNumber || null,
          address: data.address || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', createdUserId);

      if (profileError) throw new Error('Erro ao atualizar perfil: ' + profileError.message);

      // 3. Inserir na tabela students com route_id e stop_id
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          id: createdUserId,
          name: data.name,
          student_number: data.studentNumber,
          route_id: data.routeId,
          stop_id: data.stopId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (studentError) throw new Error('Erro ao criar registo do aluno: ' + studentError.message);

      toast.success('Aluno registado com sucesso!');
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registar aluno. Tente novamente.');
      // Se auth foi criado mas steps seguintes falharam, avisar o gestor
      if (createdUserId) {
        toast.warning('Conta Auth criada mas registo incompleto. Contacte o suporte se o problema persistir.');
      }
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
                      <FormDescription>A senha deve ter pelo menos 6 caracteres</FormDescription>
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

                <FormField
                  control={form.control}
                  name="routeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rota</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a rota do aluno" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routes.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stopId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paragem de Embarque</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedRouteId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedRouteId ? "Selecione a paragem" : "Selecione uma rota primeiro"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredStops.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-safebus-blue hover:bg-safebus-blue/90"
                >
                  {loading ? "A registar..." : "Registar Aluno"}
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
