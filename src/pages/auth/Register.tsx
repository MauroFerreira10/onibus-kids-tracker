
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Invitation } from '@/types';

const userRoleSchema = z.enum(['parent', 'student', 'driver', 'manager']);

const registerSchema = z.object({
  name: z.string().min(3, "Nome precisa de pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
  role: userRoleSchema,
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  childName: z.string().optional(),
  studentNumber: z.string().optional(),
  activationCode: z.string().optional(),
  schoolId: z.string().optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState<'code' | 'normal'>('normal');
  const [activationCode, setActivationCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifiedRole, setVerifiedRole] = useState<'parent' | 'driver' | 'manager' | null>(null);
  const [verifiedData, setVerifiedData] = useState<Invitation | null>(null);

  // Get role and code from URL if present
  const roleFromUrl = searchParams.get('role');
  const codeFromUrl = searchParams.get('code');
  
  useEffect(() => {
    if (codeFromUrl) {
      setRegistrationType('code');
      setActivationCode(codeFromUrl);
      verifyActivationCode(codeFromUrl);
    }
    
    // Set initial role if provided in URL
    if (roleFromUrl && ['parent', 'driver', 'manager'].includes(roleFromUrl)) {
      form.setValue('role', roleFromUrl as any);
    }
  }, [roleFromUrl, codeFromUrl]);

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
      activationCode: '',
      schoolId: '',
    },
  });
  
  const watchRole = form.watch("role");

  const verifyActivationCode = async (code: string) => {
    try {
      setLoading(true);
      // Check if code exists in invitations table
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('activation_code', code)
        .single();
      
      if (error || !data) {
        toast.error('Código de ativação inválido.');
        return;
      }
      
      // Check if code is already used
      if (data.used) {
        toast.error('Este código já foi utilizado.');
        return;
      }
      
      // If code is valid, set form data
      form.setValue('role', data.role);
      form.setValue('email', data.email || '');
      form.setValue('schoolId', data.school_id || '');
      
      setVerifiedRole(data.role);
      setVerifiedData(data as Invitation);
      setCodeVerified(true);
      toast.success('Código verificado com sucesso!');
      
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Erro ao verificar código de ativação.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (activationCode.length === 6) {
      verifyActivationCode(activationCode);
    } else {
      toast.error('Código de ativação deve ter 6 caracteres.');
    }
  };

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
          school_id: data.schoolId || null,
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
      
      // If registration was with activation code, mark it as used
      if (registrationType === 'code' && verifiedData) {
        const { error: updateCodeError } = await supabase
          .from('invitations')
          .update({ used: true, used_by: authData.user.id })
          .eq('id', verifiedData.id);
          
        if (updateCodeError) {
          console.error('Error updating activation code:', updateCodeError);
          // Not critical, just log
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
            
            <Tabs defaultValue="normal" value={registrationType} onValueChange={(v) => setRegistrationType(v as 'code' | 'normal')}>
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="normal">Cadastro Normal</TabsTrigger>
                  <TabsTrigger value="code">Código de Ativação</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="normal">
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
                      
                      <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                        <AlertDescription>
                          Pais/Responsáveis e Motoristas normalmente são registrados através de um código de ativação fornecido pelo gestor escolar.
                        </AlertDescription>
                      </Alert>
                      
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
              </TabsContent>
              
              <TabsContent value="code">
                <CardContent className="space-y-4">
                  {!codeVerified ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="activation-code">Digite o código de ativação</Label>
                        <div className="flex justify-center my-4">
                          <InputOTP maxLength={6} value={activationCode} onChange={setActivationCode}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <p className="text-center text-sm text-gray-500">
                          O código de ativação é fornecido pelo gestor escolar
                        </p>
                        <div className="flex justify-center mt-4">
                          <Button onClick={handleVerifyCode} disabled={loading || activationCode.length !== 6}>
                            {loading ? "Verificando..." : "Verificar Código"}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleRegister)}>
                        <div className="space-y-4">
                          <Alert className="bg-green-50 text-green-800 border-green-200">
                            <AlertDescription>
                              Código verificado com sucesso! Você está se registrando como {verifiedRole === 'parent' ? 'Responsável' : verifiedRole === 'driver' ? 'Motorista' : verifiedRole === 'manager' ? 'Gestor' : 'Usuário'}.
                            </AlertDescription>
                          </Alert>
                          
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
                                  <Input 
                                    type="email" 
                                    placeholder="seu@email.com" 
                                    {...field} 
                                    disabled={!!verifiedData?.email}
                                  />
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
                          
                          {verifiedRole === 'parent' && (
                            <>
                              <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Endereço para coleta/entrega</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Seu endereço" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="childName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome do filho</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Nome do filho" {...field} value={verifiedData?.child_name || field.value} disabled={!!verifiedData?.child_name} />
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
                                      <Input placeholder="Número de estudante do filho" {...field} value={verifiedData?.student_number || field.value} disabled={!!verifiedData?.student_number} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                          
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Registrando..." : "Completar Registro"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  {!codeVerified && (
                    <div className="text-center text-sm">
                      Já tem uma conta?{" "}
                      <Link to="/auth/login" className="text-busapp-primary hover:underline">
                        Entrar
                      </Link>
                    </div>
                  )}
                </CardFooter>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
