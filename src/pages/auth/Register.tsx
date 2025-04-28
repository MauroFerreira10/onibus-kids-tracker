
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  name: z.string().min(3, "Nome precisa de pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
  role: z.enum(['parent', 'student']),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  childName: z.string().optional(),
  studentNumber: z.string().optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
      contactNumber: '',
      address: '',
      childName: '',
      studentNumber: '',
    },
  });
  
  const watchRole = form.watch("role");

  const handleRegister = async (data: RegisterValues) => {
    try {
      setLoading(true);
      
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          }
        }
      });

      if (authError) {
        console.error('Registration error:', authError);
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar o usuário');
        return;
      }
      
      // Update profile with additional information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          role: data.role,
          contact_number: data.contactNumber || null,
          address: data.address || null,
        })
        .eq('id', authData.user.id);
        
      if (profileError) {
        console.error('Profile update error:', profileError);
        toast.error('Erro ao atualizar o perfil');
        return;
      }
      
      // If user is a parent, create child record
      if (data.role === 'parent' && data.childName) {
        const { error: childError } = await supabase
          .from('children')
          .insert({
            parent_id: authData.user.id,
            name: data.childName,
            student_number: data.studentNumber || null,
          });
          
        if (childError) {
          console.error('Child creation error:', childError);
          toast.error('Erro ao cadastrar informações do filho');
          return;
        }
      }
      
      console.log('Registration successful:', authData);
      toast.success('Registro realizado com sucesso! Entre com suas credenciais.');
      navigate('/auth/login');
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Registro" hideNavigation>
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center overflow-y-auto py-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
              <CardDescription className="text-center">
                Entre com seus dados para criar uma nova conta
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegister)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
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
                          <Input type="email" placeholder="seu@email.com" {...field} />
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
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Você é</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="student" id="student" />
                              <Label htmlFor="student">Aluno</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="parent" id="parent" />
                              <Label htmlFor="parent">Responsável</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu telefone" {...field} />
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
                          <Input placeholder="Seu endereço" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {watchRole === 'parent' && (
                    <>
                      <FormField
                        control={form.control}
                        name="childName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do filho</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do filho" {...field} />
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
                            <FormLabel>Número de estudante</FormLabel>
                            <FormControl>
                              <Input placeholder="Número de estudante do filho" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Registrando..." : "Registrar"}
                  </Button>
                  <div className="text-center text-sm">
                    Já tem uma conta?{" "}
                    <Link to="/auth/login" className="text-busapp-primary hover:underline">
                      Entrar
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
