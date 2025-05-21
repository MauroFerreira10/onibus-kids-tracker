import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, UserCheck, Bus, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  role: 'parent' | 'student' | 'driver' | 'manager';
  contact_number: string | null;
  address: string | null;
  children?: {
    id: string;
    name: string;
    student_number: string | null;
  }[];
}

interface ChildData {
  id: string;
  name: string;
  student_number: string | null;
}

const profileSchema = z.object({
  name: z.string().min(3, "Nome precisa ter pelo menos 3 caracteres"),
  contact_number: z.string().optional(),
  address: z.string().optional(),
});

const childSchema = z.object({
  name: z.string().min(3, "Nome precisa ter pelo menos 3 caracteres"),
  student_number: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type ChildFormValues = z.infer<typeof childSchema>;

const Profile = () => {
  const { user, session, signOut } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [isEditingChild, setIsEditingChild] = useState(false);
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      contact_number: '',
      address: '',
    },
  });
  
  const childForm = useForm<ChildFormValues>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      name: '',
      student_number: '',
    }
  });
  
  // Função para buscar os dados do perfil do usuário
  const fetchProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError);
        return;
      }
      
      // Se for pai, buscar dados dos filhos
      let childrenData = [];
      if (profileData.role === 'parent') {
        const { data: children, error: childrenError } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', user.id);
          
        if (childrenError) {
          console.error('Erro ao carregar filhos:', childrenError);
        } else {
          childrenData = children || [];
        }
      }
      
      setProfileData({
        ...profileData,
        children: childrenData,
      });
      
      // Preencher o formulário com os dados existentes
      profileForm.reset({
        name: profileData.name || '',
        contact_number: profileData.contact_number || '',
        address: profileData.address || '',
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      toast.error('Não foi possível carregar dados do perfil');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar dados do perfil quando o componente montar
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);
  
  // Função para atualizar o perfil
  const handleUpdateProfile = async (data: ProfileFormValues) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          contact_number: data.contact_number || null,
          address: data.address || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil');
        return;
      }
      
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      fetchProfileData();
    } catch (error) {
      console.error('Erro ao atualizar dados do perfil:', error);
      toast.error('Não foi possível atualizar o perfil');
    }
  };
  
  // Função para adicionar um filho
  const handleAddChild = async (data: ChildFormValues) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('children')
        .insert({
          parent_id: user.id,
          name: data.name,
          student_number: data.student_number || null,
        });
        
      if (error) {
        console.error('Erro ao adicionar filho:', error);
        toast.error('Erro ao adicionar filho');
        return;
      }
      
      toast.success('Filho adicionado com sucesso!');
      childForm.reset({
        name: '',
        student_number: '',
      });
      setIsAddingChild(false);
      fetchProfileData();
    } catch (error) {
      console.error('Erro ao adicionar filho:', error);
      toast.error('Não foi possível adicionar o filho');
    }
  };
  
  // Função para editar um filho
  const handleEditChild = (child: ChildData) => {
    setSelectedChild(child);
    childForm.reset({
      name: child.name,
      student_number: child.student_number || '',
    });
    setIsEditingChild(true);
  };
  
  // Função para atualizar um filho
  const handleUpdateChild = async (data: ChildFormValues) => {
    if (!selectedChild) return;
    
    try {
      const { error } = await supabase
        .from('children')
        .update({
          name: data.name,
          student_number: data.student_number || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedChild.id);
        
      if (error) {
        console.error('Erro ao atualizar filho:', error);
        toast.error('Erro ao atualizar filho');
        return;
      }
      
      toast.success('Dados do filho atualizados com sucesso!');
      setIsEditingChild(false);
      setSelectedChild(null);
      fetchProfileData();
    } catch (error) {
      console.error('Erro ao atualizar dados do filho:', error);
      toast.error('Não foi possível atualizar os dados do filho');
    }
  };
  
  // Função para excluir um filho
  const handleDeleteChild = async (childId: string) => {
    if (!confirm('Tem certeza que deseja remover este filho?')) return;
    
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);
        
      if (error) {
        console.error('Erro ao excluir filho:', error);
        toast.error('Erro ao excluir filho');
        return;
      }
      
      toast.success('Filho removido com sucesso!');
      fetchProfileData();
    } catch (error) {
      console.error('Erro ao excluir filho:', error);
      toast.error('Não foi possível excluir o filho');
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 pb-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : !session ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Você não está conectado</h2>
            <p className="mb-6 text-gray-600">
              Faça login para acessar seu perfil e gerenciar suas configurações
            </p>
            <div className="space-x-4">
              <Button asChild variant="default">
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/auth/register">Criar conta</Link>
              </Button>
            </div>
          </div>
        ) : profileData ? (
          <>
            {/* Visualização do perfil */}
            {!isEditing && (
              <>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>{profileData.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{profileData.name || 'Nome não informado'}</h2>
                    <p className="text-sm text-muted-foreground">{profileData.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'Papel não informado'}</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsEditing(true)}>Editar perfil</Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                {/* Seção específica para pais - filhos vinculados */}
                {profileData.role === 'parent' && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Estudantes vinculados</h3>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => {
                          childForm.reset({name: '', student_number: ''});
                          setIsAddingChild(true);
                        }}
                      >
                        Adicionar estudante
                      </Button>
                    </div>
                    
                    {/* Formulário para adicionar filho */}
                    {isAddingChild && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Adicionar estudante</CardTitle>
                          <CardDescription>Cadastre os dados do estudante</CardDescription>
                        </CardHeader>
                        <Form {...childForm}>
                          <form onSubmit={childForm.handleSubmit(handleAddChild)}>
                            <CardContent className="space-y-4">
                              <FormField
                                control={childForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome do estudante</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={childForm.control}
                                name="student_number"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Número de estudante</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setIsAddingChild(false)}
                              >
                                Cancelar
                              </Button>
                              <Button type="submit">Salvar</Button>
                            </CardFooter>
                          </form>
                        </Form>
                      </Card>
                    )}
                    
                    {/* Formulário para editar filho */}
                    {isEditingChild && selectedChild && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Editar estudante</CardTitle>
                          <CardDescription>Atualize os dados do estudante</CardDescription>
                        </CardHeader>
                        <Form {...childForm}>
                          <form onSubmit={childForm.handleSubmit(handleUpdateChild)}>
                            <CardContent className="space-y-4">
                              <FormField
                                control={childForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome do estudante</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={childForm.control}
                                name="student_number"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Número de estudante</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => {
                                  setIsEditingChild(false);
                                  setSelectedChild(null);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button type="submit">Atualizar</Button>
                            </CardFooter>
                          </form>
                        </Form>
                      </Card>
                    )}
                    
                    {/* Lista de filhos */}
                    <div className="space-y-4">
                      {profileData.children && profileData.children.length > 0 ? (
                        profileData.children.map(child => (
                          <Card key={child.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{child.name}</CardTitle>
                              <CardDescription>Estudante</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                {child.student_number && (
                                  <div className="flex items-center">
                                    <UserCheck size={16} className="mr-2 text-busapp-primary" />
                                    <span>Número: {child.student_number}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditChild(child)}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteChild(child.id)}
                              >
                                Remover
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center p-4 border rounded-md bg-muted">
                          <p>Nenhum estudante cadastrado</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}
                
                <section>
                  <h3 className="text-lg font-semibold mb-4">Informações de contato</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User size={16} className="mr-2 text-busapp-primary" />
                            <span className="text-gray-500">Email</span>
                          </div>
                          <span>{profileData.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="mr-2 text-busapp-primary"
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span className="text-gray-500">Telefone</span>
                          </div>
                          <span>{profileData.contact_number || 'Não informado'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2 text-busapp-primary" />
                            <span className="text-gray-500">Endereço</span>
                          </div>
                          <span className="text-right">{profileData.address || 'Não informado'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
            
            {/* Formulário de edição do perfil */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Editar Perfil</CardTitle>
                  <CardDescription>Atualize suas informações pessoais</CardDescription>
                </CardHeader>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="contact_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tipo de usuário</p>
                        <p>{profileData.role === 'parent' ? 'Responsável' : 'Aluno'}</p>
                        <p className="text-xs text-gray-400 mt-1">Este campo não pode ser alterado</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Salvar alterações</Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            )}
            
            <section className="pt-4">
              <Button variant="destructive" className="w-full" onClick={signOut}>Sair</Button>
            </section>
          </>
        ) : (
          <Alert>
            <AlertTitle>Erro ao carregar perfil</AlertTitle>
            <AlertDescription>
              Não foi possível carregar suas informações. 
              Por favor, tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
