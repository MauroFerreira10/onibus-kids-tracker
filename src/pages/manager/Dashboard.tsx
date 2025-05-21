import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserData } from '@/types';
import { Users, Bus, UserPlus, User, UserCog, Key, Activity, TrendingUp, AlertCircle, Calendar, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Notification, getNotifications, subscribeToNotifications, markAsRead } from '@/services/notificationService';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalParents: 0,
    totalDrivers: 0
  });
  const [growthData, setGrowthData] = useState([]);
  const [userDistribution, setUserDistribution] = useState([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);
        await checkManagerRole();
        await fetchStats();
        await fetchGrowthData();
        await fetchUserDistribution();
        await loadNotifications();
        await setupNotificationsSubscription();
      } catch (err) {
        console.error('Erro ao inicializar dashboard:', err);
        setError('Erro ao carregar o dashboard');
      } finally {
        setLoading(false);
      }
    };

    initialize();
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
        throw new Error('Erro ao buscar estatísticas');
      }
      
      setStats({
        totalStudents: studentCount || 0,
        totalParents: parentCount || 0,
        totalDrivers: driverCount || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  };

  const fetchGrowthData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at, role')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Processar dados para o gráfico de crescimento
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const processedData = last7Days.map(date => {
        const dayData = data.filter(item => 
          item.created_at.split('T')[0] === date
        );

        return {
          date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
          total: dayData.length,
          students: dayData.filter(item => item.role === 'student').length,
          parents: dayData.filter(item => item.role === 'parent').length,
          drivers: dayData.filter(item => item.role === 'driver').length,
        };
      });

      setGrowthData(processedData);
    } catch (error) {
      console.error('Erro ao buscar dados de crescimento:', error);
      toast.error('Erro ao carregar dados de crescimento');
    }
  };

  const fetchUserDistribution = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role');

      if (error) throw error;

      const distribution = [
        { name: 'Estudantes', value: data.filter(item => item.role === 'student').length },
        { name: 'Responsáveis', value: data.filter(item => item.role === 'parent').length },
        { name: 'Motoristas', value: data.filter(item => item.role === 'driver').length },
        { name: 'Gestores', value: data.filter(item => item.role === 'manager').length },
      ];

      setUserDistribution(distribution);
    } catch (error) {
      console.error('Erro ao buscar distribuição de usuários:', error);
      toast.error('Erro ao carregar distribuição de usuários');
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const setupNotificationsSubscription = () => {
    const channel = subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast.info(notification.message, {
        duration: 5000,
      });
    });

    return () => {
      channel.unsubscribe();
    };
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  if (loading) {
    return (
      <Layout title="Painel de Gestor">
        <div className="container mx-auto py-6">
          <p className="text-center">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Painel de Gestor">
        <div className="container mx-auto py-6">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Painel de Gestor">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel de Gestor</h1>
            <p className="text-muted-foreground">Bem-vindo ao seu centro de controle</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date().toLocaleDateString('pt-BR')}
            </Badge>
          <div className="text-sm text-muted-foreground">
            {user?.email && (
              <span>Conectado como: <strong>{user.email}</strong></span>
            )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <Progress value={75} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">75% da capacidade total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Responsáveis</CardTitle>
              <User className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParents}</div>
              <Progress value={60} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">60% da capacidade total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
              <Bus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDrivers}</div>
              <Progress value={45} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">45% da capacidade total</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="gerenciamento" className="space-y-4">
          <TabsList>
            <TabsTrigger value="gerenciamento">Gerenciamento</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="notificacoes">
              Notificações
              {notifications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="gerenciamento">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="flex flex-col h-24 items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                onClick={() => navigate('/manager/register-students')}
              >
                    <UserPlus className="h-6 w-6 mb-2 text-blue-600 dark:text-blue-400" />
                <span>Registrar Alunos</span>
              </Button>
              <Button
                variant="outline"
                    className="flex flex-col h-24 items-center justify-center hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
                onClick={() => navigate('/manager/register-parents')}
              >
                    <UserCog className="h-6 w-6 mb-2 text-green-600 dark:text-green-400" />
                <span>Registrar Responsáveis</span>
              </Button>
              <Button
                variant="outline"
                    className="flex flex-col h-24 items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
                onClick={() => navigate('/manager/register-drivers')}
              >
                    <Bus className="h-6 w-6 mb-2 text-purple-600 dark:text-purple-400" />
                <span>Registrar Motoristas</span>
              </Button>
              <Button
                variant="outline"
                    className="flex flex-col h-24 items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
                onClick={() => navigate('/manager/invitations')}
              >
                    <Key className="h-6 w-6 mb-2 text-orange-600 dark:text-orange-400" />
                <span>Códigos de Convite</span>
              </Button>
            </CardContent>
          </Card>
          
              <Card>
                <CardHeader>
                  <CardTitle>Alertas e Notificações</CardTitle>
                  <CardDescription>
                    Últimas atualizações e alertas importantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="font-medium">Atualização do Sistema</p>
                      <p className="text-sm text-muted-foreground">Nova versão disponível</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium">Atividade Recente</p>
                      <p className="text-sm text-muted-foreground">5 novos registros hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="atividades">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                  Acompanhe as últimas atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-4">Carregando...</p>
                ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium">Crescimento do Sistema</p>
                          <p className="text-sm text-muted-foreground">Aumento de 15% nos registros</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium">Novos Usuários</p>
                          <p className="text-sm text-muted-foreground">3 novos estudantes registrados</p>
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Métricas</CardTitle>
                <CardDescription>
                  Visualize relatórios e métricas importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                    <h3 className="font-medium mb-4">Crescimento nos Últimos 7 Dias</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={growthData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="students"
                            stackId="1"
                            stroke="#0088FE"
                            fill="#0088FE"
                            name="Estudantes"
                          />
                          <Area
                            type="monotone"
                            dataKey="parents"
                            stackId="1"
                            stroke="#00C49F"
                            fill="#00C49F"
                            name="Responsáveis"
                          />
                          <Area
                            type="monotone"
                            dataKey="drivers"
                            stackId="1"
                            stroke="#FFBB28"
                            fill="#FFBB28"
                            name="Motoristas"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <h3 className="font-medium mb-4">Distribuição de Usuários</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={userDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {userDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <h3 className="font-medium mb-4">Resumo de Atividades</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total de Registros Hoje</span>
                          <span className="font-medium">{growthData[growthData.length - 1]?.total || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Crescimento Semanal</span>
                          <span className="font-medium text-green-600">
                            {growthData.length > 0 ? 
                              `${((growthData[growthData.length - 1].total / growthData[0].total - 1) * 100).toFixed(1)}%` : 
                              '0%'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Usuários Ativos</span>
                          <span className="font-medium">{userDistribution.reduce((acc, curr) => acc + curr.value, 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Acompanhe as atualizações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma notificação
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="mt-1">
                          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{notification.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.time).toLocaleString('pt-BR')}
                          </p>
                        </div>
              <Button 
                variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
              >
                          Marcar como lida
              </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
