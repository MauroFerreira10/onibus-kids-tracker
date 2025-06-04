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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">Painel de Gestor</h1>
              <p className="text-slate-600">Bem-vindo ao seu centro de controle</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 bg-white border-slate-200 text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                {new Date().toLocaleDateString('pt-BR')}
              </Badge>
              <div className="text-sm text-slate-600">
                {user?.email && (
                  <span>Conectado como: <strong className="text-slate-800">{user.email}</strong></span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Estudantes</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stats.totalStudents}</div>
                <Progress value={75} className="mt-2 bg-blue-100" />
                <p className="text-xs text-blue-600 mt-2">75% da capacidade total</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Responsáveis</CardTitle>
                <User className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stats.totalParents}</div>
                <Progress value={60} className="mt-2 bg-purple-100" />
                <p className="text-xs text-purple-600 mt-2">60% da capacidade total</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">Motoristas</CardTitle>
                <Bus className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stats.totalDrivers}</div>
                <Progress value={45} className="mt-2 bg-indigo-100" />
                <p className="text-xs text-indigo-600 mt-2">45% da capacidade total</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="gerenciamento" className="space-y-4">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="gerenciamento" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Gerenciamento</TabsTrigger>
              <TabsTrigger value="atividades" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Atividades</TabsTrigger>
              <TabsTrigger value="relatorios" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Relatórios</TabsTrigger>
              <TabsTrigger value="notificacoes" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
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
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-800">Gerenciar Usuários</CardTitle>
                    <CardDescription className="text-slate-600">
                      Registre novos usuários ou gerencie usuários existentes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 transition-colors"
                      onClick={() => navigate('/manager/register-students')}
                    >
                      <UserPlus className="h-6 w-6 mb-2 text-blue-600" />
                      <span>Registrar Alunos</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700 transition-colors"
                      onClick={() => navigate('/manager/register-parents')}
                    >
                      <UserCog className="h-6 w-6 mb-2 text-purple-600" />
                      <span>Registrar Responsáveis</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700 transition-colors"
                      onClick={() => navigate('/manager/register-drivers')}
                    >
                      <Bus className="h-6 w-6 mb-2 text-indigo-600" />
                      <span>Registrar Motoristas</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                      onClick={() => navigate('/manager/invitations')}
                    >
                      <Key className="h-6 w-6 mb-2 text-slate-600" />
                      <span>Códigos de Convite</span>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-800">Alertas e Notificações</CardTitle>
                    <CardDescription className="text-slate-600">
                      Últimas atualizações e alertas importantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-700">Atualização do Sistema</p>
                        <p className="text-sm text-yellow-600">Nova versão disponível</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-700">Atividade Recente</p>
                        <p className="text-sm text-blue-600">5 novos registros hoje</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="atividades">
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-800">Atividades Recentes</CardTitle>
                  <CardDescription className="text-slate-600">
                    Acompanhe as últimas atividades do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <p className="text-center py-4 text-slate-600">Carregando...</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-700">Crescimento do Sistema</p>
                            <p className="text-sm text-green-600">Aumento de 15% nos registros</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-700">Novos Usuários</p>
                            <p className="text-sm text-blue-600">3 novos estudantes registrados</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="relatorios">
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-800">Relatórios e Métricas</CardTitle>
                  <CardDescription className="text-slate-600">
                    Visualize relatórios e métricas importantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                      <h3 className="font-medium mb-4 text-slate-800">Crescimento nos Últimos 7 Dias</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={growthData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="date" stroke="#64748B" />
                            <YAxis stroke="#64748B" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '0.5rem',
                                color: '#1E293B'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="students"
                              stackId="1"
                              stroke="#3B82F6"
                              fill="#93C5FD"
                              name="Estudantes"
                            />
                            <Area
                              type="monotone"
                              dataKey="parents"
                              stackId="1"
                              stroke="#8B5CF6"
                              fill="#C4B5FD"
                              name="Responsáveis"
                            />
                            <Area
                              type="monotone"
                              dataKey="drivers"
                              stackId="1"
                              stroke="#EC4899"
                              fill="#FBCFE8"
                              name="Motoristas"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <h3 className="font-medium mb-4 text-slate-800">Distribuição de Usuários</h3>
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
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '0.5rem',
                                  color: '#1E293B'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <h3 className="font-medium mb-4 text-slate-800">Resumo de Atividades</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Total de Registros Hoje</span>
                            <span className="font-medium text-slate-800">{growthData[growthData.length - 1]?.total || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Crescimento Semanal</span>
                            <span className="font-medium text-green-600">
                              {growthData.length > 0 ? 
                                `${((growthData[growthData.length - 1].total / growthData[0].total - 1) * 100).toFixed(1)}%` : 
                                '0%'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Usuários Ativos</span>
                            <span className="font-medium text-slate-800">{userDistribution.reduce((acc, curr) => acc + curr.value, 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notificacoes">
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-800">Notificações</CardTitle>
                  <CardDescription className="text-slate-600">
                    Acompanhe as atualizações do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <p className="text-center text-slate-600 py-4">
                        Nenhuma notificação
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <div className="mt-1">
                            <Bell className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{notification.type}</p>
                            <p className="text-sm text-slate-600">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(notification.time).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
