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
import logo from '@/assets/logo.svg';

const userRoleSchema = z.enum(['student', 'parent', 'driver', 'manager']);

const registerSchema = z.object({
  name: z.string().min(3, "Nome precisa de pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
  role: userRoleSchema,
  contactNumber: z.string().optional(),
  address: z.string().optional(),
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
  const [verifiedRole, setVerifiedRole] = useState<'student' | 'parent' | 'driver' | 'manager' | null>(null);
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
    if (roleFromUrl && ['student'].includes(roleFromUrl)) {
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
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao verificar código:', error);
        toast.error('Erro ao verificar código de ativação.');
        return;
      }
      
      if (!data) {
        toast.error('Código de ativação inválido.');
        return;
      }
      
      // Check if code is already used
      if (data.used) {
        toast.error('Este código já foi utilizado.');
        return;
      }
      
      // Check if code has expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        toast.error('Este código de ativação expirou.');
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
      
      console.log('Iniciando registro com dados:', { ...data, password: '[REDACTED]' });
      
      // Validar dados antes do registro
      if (!data.email || !data.password || !data.name || !data.role) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        console.error('Erro detalhado no registro:', authError);
        if (authError.message.includes('already registered')) {
          toast.error('Este email já está registrado');
        } else {
          toast.error(`Erro no registro: ${authError.message}`);
        }
        return;
      }

      if (!authData.user) {
        console.error('Nenhum usuário retornado após registro');
        toast.error('Erro ao criar o usuário');
        return;
      }

      console.log('Usuário criado com sucesso:', authData.user.id);
      
      // Update profile with additional information using upsert
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: data.name,
          role: data.role,
          contact_number: data.contactNumber || null,
          address: data.address || null,
          school_id: data.schoolId || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
        
      if (profileError) {
        console.error('Erro detalhado ao atualizar perfil:', profileError);
        toast.error(`Erro ao atualizar perfil: ${profileError.message}`);
        return;
      }
      
      console.log('Perfil atualizado com sucesso');
      
      // If user is a student, create student record
      if (data.role === 'student') {
        const { error: studentError } = await supabase
          .from('students')
          .upsert({
            id: authData.user.id,
            name: data.name,
            student_number: data.studentNumber || null
          }, {
            onConflict: 'id'
          });
          
        if (studentError) {
          console.error('Erro detalhado ao criar registro do aluno:', studentError);
          toast.error(`Erro ao cadastrar aluno: ${studentError.message}`);
          return;
        }
        
        console.log('Registro do aluno criado com sucesso');
      }
      
      // If registration was with activation code, mark it as used
      if (registrationType === 'code' && verifiedData) {
        const { error: updateCodeError } = await supabase
          .from('invitations')
          .update({ used: true, used_by: authData.user.id })
          .eq('id', verifiedData.id);
          
        if (updateCodeError) {
          console.error('Erro ao atualizar código de ativação:', updateCodeError);
          // Not critical, just log
        }
      }
      
      console.log('Registro concluído com sucesso');
      toast.success('Registro realizado com sucesso! Entre com suas credenciais.');
      navigate('/auth/login');
    } catch (error) {
      console.error('Erro durante o registro:', error);
      toast.error('Erro ao criar conta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Registro" hideNavigation>
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
              <CardTitle className="text-2xl text-center">Registro</CardTitle>
              <CardDescription className="text-center text-white/90">
                Crie sua conta para começar
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="normal" value={registrationType} onValueChange={(v) => setRegistrationType(v as 'code' | 'normal')}>
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="normal" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Cadastro Normal</TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Código de Ativação</TabsTrigger>
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
                            <FormLabel className="text-gray-700">Nome completo</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Seu nome" 
                                {...field} 
                                className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              />
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
                            <FormLabel className="text-gray-700">Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
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
                            <FormLabel className="text-gray-700">Senha</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
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
                            <FormLabel>Tipo de Usuário</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="student" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Estudante
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                        <AlertDescription>
                          Pais/Responsáveis, Motoristas e Gestores são registrados através de um código de ativação fornecido pelo gestor escolar.
                        </AlertDescription>
                      </Alert>
                      
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu telefone" {...field} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
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
                            <FormLabel className="text-gray-700">Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu endereço" {...field} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {watchRole === 'student' && (
                          <FormField
                            control={form.control}
                            name="studentNumber"
                            render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-gray-700">Número de estudante</FormLabel>
                                <FormControl>
                                <Input placeholder="Seu número de estudante" {...field} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium py-2.5" 
                        disabled={loading}
                      >
                        {loading ? "Registrando..." : "Registrar"}
                      </Button>
                      <div className="text-center text-sm text-gray-600 mt-4">
                        Já tem uma conta?{" "}
                        <Link to="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
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
                        <Label htmlFor="activation-code" className="text-gray-700">Digite o código de ativação</Label>
                        <div className="flex justify-center my-4">
                          <Input 
                            type="text"
                            value={activationCode}
                            onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="text-center text-2xl tracking-widest uppercase"
                            placeholder="Digite o código"
                          />
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
                                <FormLabel className="text-gray-700">Nome completo</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Seu nome" 
                                    {...field} 
                                    className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                  />
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
                                <FormLabel className="text-gray-700">Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="seu@email.com" 
                                    {...field} 
                                    disabled={!!verifiedData?.email}
                                    className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
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
                                <FormLabel className="text-gray-700">Senha</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
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
                                <FormLabel className="text-gray-700">Telefone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seu telefone" {...field} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
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
                                    <FormLabel className="text-gray-700">Endereço para coleta/entrega</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Seu endereço" {...field} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
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
                                    <FormLabel className="text-gray-700">Número de estudante</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Número de estudante do filho" {...field} value={verifiedData?.student_number || field.value} disabled={!!verifiedData?.student_number} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                          
                          {verifiedRole === 'student' && (
                            <FormField
                              control={form.control}
                              name="studentNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700">Número de estudante</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Seu número de estudante" {...field} className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium py-2.5" disabled={loading}>
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
                      <Link to="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
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
