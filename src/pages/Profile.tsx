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
import PushNotificationToggle from '@/components/notifications/PushNotificationToggle';
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
  
  const roleLabels: Record<string, string> = {
    parent: 'Responsável',
    student: 'Estudante',
    driver: 'Motorista',
    manager: 'Gestor',
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-[200px] w-full rounded-2xl" />
            </motion.div>
          ) : !session ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-2xl shadow-md border border-safebus-blue/10"
            >
              <div className="w-20 h-20 bg-safebus-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-safebus-blue/40" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-safebus-blue">Você não está conectado</h2>
              <p className="mb-6 text-gray-500">Faça login para acessar o seu perfil</p>
              <div className="flex justify-center gap-3">
                <Button asChild className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold border-0">
                  <Link to="/auth/login">Entrar</Link>
                </Button>
                <Button asChild variant="outline" className="border-safebus-blue/20 text-safebus-blue hover:bg-safebus-blue/5">
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
                  className="space-y-6"
                >
                  {/* Hero Profile Header */}
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="relative overflow-hidden bg-gradient-to-br from-safebus-blue via-safebus-blue to-safebus-blue-dark rounded-2xl shadow-xl"
                  >
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FBBF24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
                      }}
                    />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-safebus-yellow/10 rounded-full -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-24 h-24 border-4 border-safebus-yellow shadow-2xl">
                          <AvatarImage src="/avatars/01.png" alt="Avatar" />
                          <AvatarFallback className="text-3xl bg-safebus-yellow text-safebus-blue font-extrabold">
                            {profileData.name?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-safebus-blue flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                          {profileData.name || 'Sem nome'}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1.5 bg-safebus-yellow text-safebus-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            <UserCheck className="w-3.5 h-3.5" />
                            {roleLabels[profileData.role] || profileData.role}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                            <Mail className="w-3 h-3" />
                            {profileData.email}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="mt-4 bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold border-0"
                        >
                          Editar perfil
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Estudantes vinculados */}
                  {profileData.role === 'parent' && (
                    <motion.section
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-2xl shadow-md border border-safebus-blue/10 overflow-hidden"
                    >
                      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-safebus-blue/3 to-transparent flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-safebus-blue">Estudantes vinculados</h3>
                          <p className="text-sm text-gray-400 mt-0.5">Filhos cadastrados ao seu perfil</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => { childForm.reset({ name: '', student_number: '' }); setIsAddingChild(true); }}
                          className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold border-0"
                        >
                          + Adicionar
                        </Button>
                      </div>

                      <div className="p-5">
                        {profileData.children && profileData.children.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {profileData.children.map((child, index) => (
                              <motion.div
                                key={child.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group rounded-xl border border-gray-100 hover:border-safebus-blue/30 bg-white hover:shadow-md transition-all p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-safebus-blue to-safebus-blue-dark rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
                                    {child.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-safebus-blue truncate">{child.name}</h4>
                                    {child.student_number ? (
                                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                        <UserCheck className="w-3 h-3" />
                                        Nº {child.student_number}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-gray-400 mt-0.5">Sem número</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                  <button
                                    onClick={() => handleEditChild(child)}
                                    className="flex-1 text-xs font-semibold text-safebus-blue hover:bg-safebus-blue/5 py-1.5 rounded-md transition-colors"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteChild(child.id)}
                                    className="flex-1 text-xs font-semibold text-red-500 hover:bg-red-50 py-1.5 rounded-md transition-colors"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <div className="w-14 h-14 bg-safebus-blue/5 rounded-full flex items-center justify-center mx-auto mb-3">
                              <User className="w-7 h-7 text-safebus-blue/30" />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">Nenhum estudante cadastrado</p>
                          </div>
                        )}
                      </div>
                    </motion.section>
                  )}

                  {/* Informações de contato */}
                  <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-md border border-safebus-blue/10 overflow-hidden"
                  >
                    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-safebus-blue/3 to-transparent">
                      <h3 className="text-lg font-bold text-safebus-blue">Informações de contato</h3>
                      <p className="text-sm text-gray-400 mt-0.5">Os teus dados pessoais</p>
                    </div>
                    <div className="p-5 space-y-2">
                      {[
                        { icon: Mail, label: 'Email', value: profileData.email },
                        { icon: Phone, label: 'Telefone', value: profileData.contact_number || 'Não informado' },
                        { icon: Home, label: 'Endereço', value: profileData.address || 'Não informado' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-safebus-blue/3 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-safebus-blue/10 rounded-lg">
                              <item.icon className="w-4 h-4 text-safebus-blue" />
                            </div>
                            <span className="text-xs uppercase tracking-widest font-bold text-safebus-blue/60">{item.label}</span>
                          </div>
                          <span className="font-semibold text-safebus-blue text-right truncate ml-2 max-w-[60%]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.section>

                  {/* Notificações Push */}
                  <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-2xl shadow-md border border-safebus-blue/10 overflow-hidden"
                  >
                    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-safebus-blue/3 to-transparent">
                      <h3 className="text-lg font-bold text-safebus-blue">Notificações</h3>
                      <p className="text-sm text-gray-400 mt-0.5">Configura os alertas em tempo real</p>
                    </div>
                    <div className="p-5">
                      <PushNotificationToggle />
                    </div>
                  </motion.section>

                  {/* Botão de Sair */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold py-6 rounded-xl"
                      onClick={signOut}
                    >
                      Sair da conta
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="profile-edit"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-white border border-safebus-blue/10 shadow-md rounded-2xl">
                    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-safebus-blue/3 to-transparent">
                      <CardTitle className="text-2xl text-safebus-blue font-bold">Editar Perfil</CardTitle>
                      <CardDescription>Atualize as suas informações pessoais</CardDescription>
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
                                  <Input {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                                  <Input {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                                  <Textarea {...field} className="border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue" />
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
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold border-0"
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