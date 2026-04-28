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
import AnimatedBusScene from '@/components/auth/AnimatedBusScene';

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

      // Register user with Supabase Auth - simplified approach
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
      
      // Try to update profile - if it fails, continue anyway
      try {
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
          console.warn('Aviso: Não foi possível atualizar o perfil completo:', profileError.message);
          // Don't return here - let user continue with basic registration
        } else {
          console.log('Perfil atualizado com sucesso');
        }
      } catch (profileUpdateError) {
        console.warn('Aviso: Erro ao atualizar perfil:', profileUpdateError);
        // Continue with basic registration
      }
      
      // Try to create student record if applicable
      if (data.role === 'student') {
        try {
          // Try to get routes for assignment
          const { data: routesData } = await supabase
            .from('routes')
            .select('id')
            .limit(1);
          
          const routeIdToAssign = routesData && routesData.length > 0 ? routesData[0].id : null;
          
          const { error: studentError } = await supabase
            .from('students')
            .upsert({
              id: authData.user.id,
              name: data.name,
              student_number: data.studentNumber || null,
              route_id: routeIdToAssign, // Assign to first available route
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });
          
          if (studentError) {
            console.warn('Aviso: Não foi possível criar registro do aluno:', studentError.message);
          } else {
            console.log('Registro do aluno criado com sucesso com route_id:', routeIdToAssign);
          }
        } catch (studentError) {
          console.warn('Aviso: Erro ao criar registro do aluno:', studentError);
        }
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
      <div className="h-screen w-screen flex flex-col items-center justify-start relative overflow-hidden bg-gradient-to-br from-safebus-blue via-safebus-blue to-safebus-blue-dark pt-8">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FBBF24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-safebus-yellow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[500px] h-[500px] bg-safebus-yellow/5 rounded-full blur-3xl pointer-events-none" />
        {/* Animated bus scene */}
        <AnimatedBusScene />

        <div className="w-full max-w-md px-4 relative z-10 max-h-screen overflow-y-auto py-6 no-scrollbar flex flex-col items-center">
          <div className="text-center -mb-2">
            <img src="/safebus-logo.png" alt="SafeBus Logo" className="w-56 h-auto mx-auto mb-0 drop-shadow-2xl" />
            <p className="text-safebus-yellow font-orbitron text-lg tracking-widest font-bold">Segurança em cada trajeto</p>
          </div>
          <Card className="shadow-2xl border-0 bg-white w-full mt-5">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center text-safebus-blue font-bold">Criar Conta</CardTitle>
              <CardDescription className="text-center text-gray-500">
                Junte-se ao SafeBus em poucos passos
              </CardDescription>
            </CardHeader>

            <Tabs defaultValue="normal" value={registrationType} onValueChange={(v) => setRegistrationType(v as 'code' | 'normal')}>
              <div className="px-6 pt-2">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="normal" className="data-[state=active]:bg-safebus-yellow data-[state=active]:text-safebus-blue data-[state=active]:font-bold">Cadastro Normal</TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:bg-safebus-yellow data-[state=active]:text-safebus-blue data-[state=active]:font-bold">Código de Ativação</TabsTrigger>
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
                            <FormLabel className="text-safebus-blue font-medium">Nome completo</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Seu nome" 
                                {...field} 
                                className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue"
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
                            <FormLabel className="text-safebus-blue font-medium">Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                            <FormLabel className="text-safebus-blue font-medium">Senha</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                            <FormLabel className="text-safebus-blue font-medium">Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu telefone" {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                            <FormLabel className="text-safebus-blue font-medium">Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu endereço" {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                              <FormLabel className="text-safebus-blue font-medium">Número de estudante</FormLabel>
                                <FormControl>
                                <Input placeholder="Seu número de estudante" {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                        className="w-full bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold py-3 shadow-lg shadow-safebus-yellow/30 transition-all" 
                        disabled={loading}
                      >
                        {loading ? "Registrando..." : "Registrar"}
                      </Button>
                      <div className="text-center text-sm text-gray-600 mt-4">
                        Já tem uma conta?{" "}
                        <Link to="/auth/login" className="text-safebus-blue hover:text-safebus-blue-light font-semibold">
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
                        <Label htmlFor="activation-code" className="text-safebus-blue font-medium">Digite o código de ativação</Label>
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
                                <FormLabel className="text-safebus-blue font-medium">Nome completo</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Seu nome" 
                                    {...field} 
                                    className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue"
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
                                <FormLabel className="text-safebus-blue font-medium">Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="seu@email.com" 
                                    {...field} 
                                    disabled={!!verifiedData?.email}
                                    className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue"
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
                                <FormLabel className="text-safebus-blue font-medium">Senha</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                                <FormLabel className="text-safebus-blue font-medium">Telefone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seu telefone" {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                                    <FormLabel className="text-safebus-blue font-medium">Endereço para coleta/entrega</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Seu endereço" {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                                    <FormLabel className="text-safebus-blue font-medium">Número de estudante</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Número de estudante do filho" {...field} value={verifiedData?.student_number || field.value} disabled={!!verifiedData?.student_number} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue disabled:bg-gray-50" />
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
                                  <FormLabel className="text-safebus-blue font-medium">Número de estudante</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Seu número de estudante" {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          <Button type="submit" className="w-full bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold py-3 shadow-lg shadow-safebus-yellow/30 transition-all" disabled={loading}>
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
                      <Link to="/auth/login" className="text-safebus-blue hover:text-safebus-blue-light font-semibold">
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
