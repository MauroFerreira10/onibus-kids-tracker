import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserData } from '@/types';
import { Users, Bus, UserPlus, User, UserCog, Key, Activity, TrendingUp, AlertCircle, Calendar, Bell, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Notification, getNotifications, subscribeToNotifications, markAsRead } from '@/services/notificationService';
import { ActivityLog, getRecentActivities, logActivity } from '@/services/activityService';
import { motion } from 'framer-motion';
import { GenerateWordDocument } from '@/components/manager/GenerateWordDocument';

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
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState('gerenciamento');

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
        await fetchRecentActivities();

        // Adicionar algumas atividades de exemplo
        await logActivity('Dashboard Inicializado', 'Painel do gestor carregado com sucesso');
        await logActivity('Estatísticas Atualizadas', `Total de estudantes: ${stats.totalStudents}, Responsáveis: ${stats.totalParents}, Motoristas: ${stats.totalDrivers}`);
        await logActivity('Relatórios Gerados', 'Relatórios de crescimento e distribuição de usuários atualizados');
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

  const fetchRecentActivities = async () => {
    try {
      const activities = await getRecentActivities(5);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      toast.error('Erro ao carregar atividades recentes');
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="container mx-auto py-8 space-y-8">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-indigo-100"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Painel de Gestor</h1>
              <p className="text-slate-600 mt-1">Bem-vindo ao seu centro de controle</p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 bg-white/80 backdrop-blur-sm border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
                <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                {new Date().toLocaleDateString('pt-BR')}
              </Badge>
              <div className="text-sm text-slate-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-indigo-100">
                {user?.email && (
                  <span>Conectado como: <strong className="text-indigo-600">{user.email}</strong></span>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500 hover:shadow-xl transition-all hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Estudantes</CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalStudents}</div>
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm text-emerald-300">+12% este mês</span>
                  </div>
                  <Progress value={75} className="mt-4 bg-white/20" />
                  <p className="text-xs text-white/80 mt-2">75% da capacidade total</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-400 to-purple-600 border-purple-500 hover:shadow-xl transition-all hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Responsáveis</CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalParents}</div>
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm text-emerald-300">+8% este mês</span>
                  </div>
                  <Progress value={60} className="mt-4 bg-white/20" />
                  <p className="text-xs text-white/80 mt-2">60% da capacidade total</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-pink-400 to-pink-600 border-pink-500 hover:shadow-xl transition-all hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Motoristas</CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Bus className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalDrivers}</div>
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-red-300" />
                    <span className="text-sm text-red-300">-2% este mês</span>
                  </div>
                  <Progress value={45} className="mt-4 bg-white/20" />
                  <p className="text-xs text-white/80 mt-2">45% da capacidade total</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-indigo-100 p-1 rounded-lg">
              <TabsTrigger 
                value="gerenciamento" 
                className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 rounded-md px-4 py-2"
              >
                Gerenciamento
              </TabsTrigger>
              <TabsTrigger 
                value="atividades" 
                className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 rounded-md px-4 py-2"
              >
                Atividades
              </TabsTrigger>
              <TabsTrigger 
                value="relatorios" 
                className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 rounded-md px-4 py-2"
              >
                Relatórios
              </TabsTrigger>
              <TabsTrigger 
                value="notificacoes" 
                className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 rounded-md px-4 py-2 relative"
              >
                Notificações
                {notifications.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="gerenciamento">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-indigo-700">Gerenciar Usuários</CardTitle>
                    <CardDescription className="text-indigo-600">
                      Registre novos usuários ou gerencie usuários existentes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0 transition-all hover:scale-105"
                      onClick={() => navigate('/manager/register-students')}
                    >
                      <UserPlus className="h-6 w-6 mb-2 text-white" />
                      <span>Registrar Alunos</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white border-0 transition-all hover:scale-105"
                      onClick={() => navigate('/manager/register-parents')}
                    >
                      <UserCog className="h-6 w-6 mb-2 text-white" />
                      <span>Registrar Responsáveis</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white border-0 transition-all hover:scale-105"
                      onClick={() => navigate('/manager/register-drivers')}
                    >
                      <Bus className="h-6 w-6 mb-2 text-white" />
                      <span>Registrar Motoristas</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700 text-white border-0 transition-all hover:scale-105"
                      onClick={() => navigate('/manager/invitations')}
                    >
                      <Key className="h-6 w-6 mb-2 text-white" />
                      <span>Códigos de Convite</span>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-indigo-700">Alertas e Notificações</CardTitle>
                    <CardDescription className="text-indigo-600">
                      Últimas atualizações e alertas importantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg hover:shadow-lg transition-all cursor-pointer group">
                      <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">Atualização do Sistema</p>
                        <p className="text-sm text-white/90">Nova versão disponível</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg hover:shadow-lg transition-all cursor-pointer group"
                         onClick={() => setActiveTab('atividades')}>
                      <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">Atividade Recente</p>
                        <p className="text-sm text-white/90">5 novos registros hoje</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="atividades">
              <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-indigo-700">Atividades Recentes</CardTitle>
                  <CardDescription className="text-indigo-600">
                    Acompanhe as últimas atividades do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : recentActivities.length === 0 ? (
                      <div className="text-center py-8 text-indigo-600">
                        Nenhuma atividade registrada
                      </div>
                    ) : (
                      recentActivities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg hover:shadow-lg transition-all cursor-pointer group"
                        >
                          <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                            <Activity className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{activity.action}</p>
                            <p className="text-sm text-white/90">{activity.details}</p>
                            <p className="text-xs text-white/70 mt-1">
                              {new Date(activity.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="relatorios">
              <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-indigo-700">Relatórios e Métricas</CardTitle>
                  <CardDescription className="text-indigo-600">
                    Visualize relatórios e métricas importantes
                  </CardDescription>
                  <div className="mt-4">
                    <GenerateWordDocument />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-6 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-lg hover:shadow-xl transition-all"
                    >
                      <h3 className="font-medium mb-4 text-indigo-700">Crescimento nos Últimos 7 Dias</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={growthData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="colorParents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="colorDrivers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#64748B"
                              tick={{ fill: '#64748B' }}
                            />
                            <YAxis 
                              stroke="#64748B"
                              tick={{ fill: '#64748B' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '0.5rem',
                                color: '#1E293B',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="students"
                              stackId="1"
                              stroke="#3B82F6"
                              fillOpacity={1}
                              fill="url(#colorStudents)"
                              name="Estudantes"
                            />
                            <Area
                              type="monotone"
                              dataKey="parents"
                              stackId="1"
                              stroke="#8B5CF6"
                              fillOpacity={1}
                              fill="url(#colorParents)"
                              name="Responsáveis"
                            />
                            <Area
                              type="monotone"
                              dataKey="drivers"
                              stackId="1"
                              stroke="#EC4899"
                              fillOpacity={1}
                              fill="url(#colorDrivers)"
                              name="Motoristas"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-lg hover:shadow-xl transition-all"
                      >
                        <h3 className="font-medium mb-4 text-indigo-700">Distribuição de Usuários</h3>
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
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]}
                                    className="hover:opacity-80 transition-opacity"
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '0.5rem',
                                  color: '#1E293B',
                                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-lg hover:shadow-xl transition-all"
                      >
                        <h3 className="font-medium mb-4 text-indigo-700">Resumo de Atividades</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg">
                            <span className="text-sm text-white/90">Total de Registros Hoje</span>
                            <span className="font-medium text-white">{growthData[growthData.length - 1]?.total || 0}</span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg">
                            <span className="text-sm text-white/90">Crescimento Semanal</span>
                            <span className="font-medium text-white">
                              {growthData.length > 0 ? 
                                `${((growthData[growthData.length - 1].total / growthData[0].total - 1) * 100).toFixed(1)}%` : 
                                '0%'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg">
                            <span className="text-sm text-white/90">Usuários Ativos</span>
                            <span className="font-medium text-white">{userDistribution.reduce((acc, curr) => acc + curr.value, 0)}</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notificacoes">
              <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-indigo-700">Notificações</CardTitle>
                  <CardDescription className="text-indigo-600">
                    Gerencie suas notificações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-indigo-600">
                        Nenhuma notificação no momento
                      </div>
                    ) : (
                      notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg hover:shadow-lg transition-all group"
                        >
                          <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                            <Bell className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{notification.message}</p>
                            <p className="text-sm text-white/90">
                              {new Date(notification.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-white hover:text-white hover:bg-white/20"
                          >
                            Marcar como lida
                          </Button>
                        </motion.div>
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
