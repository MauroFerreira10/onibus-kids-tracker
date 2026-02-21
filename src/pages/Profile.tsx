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
import { User, UserCheck, Bus, Clock, MapPin, Phone, Mail, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-2/3 mx-auto" />
              <Skeleton className="h-[200px] w-full" />
            </motion.div>
          ) : !session ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                Você não está conectado
              </h2>
              <p className="mb-8 text-gray-600">
                Faça login para acessar seu perfil e gerenciar suas configurações
              </p>
              <div className="space-x-4">
                <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Link to="/auth/register">Criar conta</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="profile-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Header com Avatar e Nome - design profissional */}
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20 border-2 border-gray-200">
                          <AvatarImage src="/avatars/01.png" alt="Avatar" />
                          <AvatarFallback className="text-xl bg-gray-100 text-gray-700 border border-gray-200">
                            {profileData.name?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                          {profileData.name || 'Nome não informado'}
                        </h2>
                        <p className="text-gray-600 mt-1">
                          {profileData.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'Papel não informado'}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditing(true)}
                          className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Editar perfil
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Seção de Estudantes Vinculados */}
                  {profileData.role === 'parent' && (
                    <motion.section 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Estudantes vinculados
                        </h3>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {
                            childForm.reset({name: '', student_number: ''});
                            setIsAddingChild(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Adicionar estudante
                        </Button>
                      </div>

                      {/* Lista de Estudantes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profileData.children && profileData.children.length > 0 ? (
                          profileData.children.map((child, index) => (
                            <motion.div
                              key={child.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg text-gray-900">
                                    {child.name}
                                  </CardTitle>
                                  <CardDescription>Estudante</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2 text-sm">
                                    {child.student_number && (
                                      <div className="flex items-center">
                                        <UserCheck size={16} className="mr-2 text-gray-500" />
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
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                  >
                                    Editar
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteChild(child.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remover
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-2 text-center p-8 border rounded-xl bg-white border-gray-200"
                          >
                            <p className="text-gray-500">Nenhum estudante cadastrado</p>
                          </motion.div>
                        )}
                      </div>
                    </motion.section>
                  )}

                  {/* Informações de Contato */}
                  <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">
                      Informações de contato
                    </h3>
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                              <Mail size={18} className="mr-3 text-gray-600" />
                              <span className="text-gray-600">Email</span>
                            </div>
                            <span className="font-medium">{profileData.email}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                              <Phone size={18} className="mr-3 text-gray-600" />
                              <span className="text-gray-600">Telefone</span>
                            </div>
                            <span className="font-medium">{profileData.contact_number || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                              <Home size={18} className="mr-3 text-gray-600" />
                              <span className="text-gray-600">Endereço</span>
                            </div>
                            <span className="font-medium text-right">{profileData.address || 'Não informado'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.section>

                  {/* Botão de Sair */}
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4"
                  >
                    <Button 
                      variant="destructive" 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={signOut}
                    >
                      Sair
                    </Button>
                  </motion.section>
                </motion.div>
              ) : (
                <motion.div
                  key="profile-edit"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-900">
                        Editar Perfil
                      </CardTitle>
                      <CardDescription>Atualize suas informações pessoais</CardDescription>
                    </CardHeader>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
                        <CardContent className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome completo</FormLabel>
                                <FormControl>
                                  <Input {...field} className="border-gray-300 focus:border-blue-500" />
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
                                  <Input {...field} className="border-gray-300 focus:border-blue-500" />
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
                                  <Textarea {...field} className="border-gray-300 focus:border-blue-500" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-sm font-medium text-gray-700">Tipo de usuário</p>
                            <p className="text-gray-900">{profileData.role === 'parent' ? 'Responsável' : 'Aluno'}</p>
                            <p className="text-xs text-gray-500 mt-1">Este campo não pode ser alterado</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Salvar alterações
                          </Button>
                        </CardFooter>
                      </form>
                    </Form>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;