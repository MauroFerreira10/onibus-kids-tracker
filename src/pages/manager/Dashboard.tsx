
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserData } from '@/types';
import { Users, Bus, UserPlus, User, UserCog, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalParents: 0,
    totalDrivers: 0
  });

  useEffect(() => {
    checkManagerRole();
    fetchStats();
  }, []);

  const checkManagerRole = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast.error('Usuário não autenticado');
        navigate('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (error || data.role !== 'manager') {
        toast.error('Acesso restrito a gestores');
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      toast.error('Erro ao verificar permissões');
      navigate('/');
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch student count
      const { count: studentCount, error: studentError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student');
      
      // Fetch parent count
      const { count: parentCount, error: parentError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'parent');
      
      // Fetch driver count
      const { count: driverCount, error: driverError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'driver');
      
      if (studentError || parentError || driverError) {
        console.error('Erro ao buscar estatísticas');
        return;
      }
      
      setStats({
        totalStudents: studentCount || 0,
        totalParents: parentCount || 0,
        totalDrivers: driverCount || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Painel de Gestor">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Painel de Gestor</h1>
          <div className="text-sm text-muted-foreground">
            {user?.email && (
              <span>Conectado como: <strong>{user.email}</strong></span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Responsáveis</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDrivers}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Registre novos usuários ou gerencie usuários existentes
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center"
                onClick={() => navigate('/manager/register-students')}
              >
                <UserPlus className="h-6 w-6 mb-2" />
                <span>Registrar Alunos</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center"
                onClick={() => navigate('/manager/register-parents')}
              >
                <UserCog className="h-6 w-6 mb-2" />
                <span>Registrar Responsáveis</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center"
                onClick={() => navigate('/manager/register-drivers')}
              >
                <Bus className="h-6 w-6 mb-2" />
                <span>Registrar Motoristas</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center"
                onClick={() => navigate('/manager/invitations')}
              >
                <Key className="h-6 w-6 mb-2" />
                <span>Códigos de Convite</span>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Últimos registros e atividades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loading ? (
                  <p className="text-center py-4">Carregando...</p>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Ainda não há atividades registradas
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full"
              >
                Ver Todas as Atividades
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
