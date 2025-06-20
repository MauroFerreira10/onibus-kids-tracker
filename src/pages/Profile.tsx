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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
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
              className="text-center py-12 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Você não está conectado
              </h2>
              <p className="mb-8 text-gray-600">
                Faça login para acessar seu perfil e gerenciar suas configurações
              </p>
              <div className="space-x-4">
                <Button asChild variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
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
                  {/* Header com Avatar e Nome */}
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
                    <div className="relative flex items-center space-x-6">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50" />
                        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                          <AvatarImage src="/avatars/01.png" alt="Avatar" />
                          <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {profileData.name?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {profileData.name || 'Nome não informado'}
                        </h2>
                        <p className="text-lg text-gray-600 mt-1">
                          {profileData.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'Papel não informado'}
                        </p>
                        <motion.div whileHover={{ scale: 1.02 }} className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsEditing(true)}
                            className="bg-white/50 backdrop-blur-sm border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Editar perfil
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Seção de Estudantes Vinculados */}
                  {profileData.role === 'parent' && (
                    <motion.section 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Estudantes vinculados
                        </h3>
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              childForm.reset({name: '', student_number: ''});
                              setIsAddingChild(true);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                          >
                            Adicionar estudante
                          </Button>
                        </motion.div>
                      </div>

                      {/* Lista de Estudantes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profileData.children && profileData.children.length > 0 ? (
                          profileData.children.map((child, index) => (
                            <motion.div
                              key={child.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <Card className="bg-white/80 backdrop-blur-sm border-blue-100 hover:border-blue-200 transition-colors">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {child.name}
                                  </CardTitle>
                                  <CardDescription>Estudante</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2 text-sm">
                                    {child.student_number && (
                                      <div className="flex items-center">
                                        <UserCheck size={16} className="mr-2 text-blue-500" />
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
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                  >
                                    Editar
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteChild(child.id)}
                                    className="bg-red-500 hover:bg-red-600"
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
                            className="col-span-2 text-center p-8 border rounded-xl bg-white/50 backdrop-blur-sm"
                          >
                            <p className="text-gray-500">Nenhum estudante cadastrado</p>
                          </motion.div>
                        )}
                      </div>
                    </motion.section>
                  )}

                  {/* Informações de Contato */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Informações de contato
                    </h3>
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50/50 transition-colors"
                          >
                            <div className="flex items-center">
                              <Mail size={18} className="mr-3 text-blue-500" />
                              <span className="text-gray-600">Email</span>
                            </div>
                            <span className="font-medium">{profileData.email}</span>
                          </motion.div>
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50/50 transition-colors"
                          >
                            <div className="flex items-center">
                              <Phone size={18} className="mr-3 text-blue-500" />
                              <span className="text-gray-600">Telefone</span>
                            </div>
                            <span className="font-medium">{profileData.contact_number || 'Não informado'}</span>
                          </motion.div>
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50/50 transition-colors"
                          >
                            <div className="flex items-center">
                              <Home size={18} className="mr-3 text-blue-500" />
                              <span className="text-gray-600">Endereço</span>
                            </div>
                            <span className="font-medium text-right">{profileData.address || 'Não informado'}</span>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.section>

                  {/* Botão de Sair */}
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="pt-4"
                  >
                    <Button 
                      variant="destructive" 
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
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
                  <Card className="bg-white/80 backdrop-blur-lg border-blue-100">
                    <CardHeader>
                      <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                                  <Input {...field} className="bg-white/50" />
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
                                  <Input {...field} className="bg-white/50" />
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
                                  <Textarea {...field} className="bg-white/50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="p-4 rounded-lg bg-blue-50/50">
                            <p className="text-sm font-medium text-blue-600">Tipo de usuário</p>
                            <p className="text-blue-800">{profileData.role === 'parent' ? 'Responsável' : 'Aluno'}</p>
                            <p className="text-xs text-blue-500 mt-1">Este campo não pode ser alterado</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
