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

  const quickActions = [
    {
      label: 'Registrar Alunos',
      icon: UserPlus,
      route: '/manager/register-students',
      bg: 'bg-safebus-blue',
      hover: 'hover:bg-safebus-blue-dark',
    },
    {
      label: 'Registrar Responsáveis',
      icon: UserCog,
      route: '/manager/register-parents',
      bg: 'bg-safebus-yellow',
      hover: 'hover:bg-safebus-yellow-dark',
      textColor: 'text-safebus-blue',
    },
    {
      label: 'Registrar Motoristas',
      icon: Bus,
      route: '/manager/register-drivers',
      bg: 'bg-safebus-blue',
      hover: 'hover:bg-safebus-blue-dark',
    },
    {
      label: 'Códigos de Convite',
      icon: Key,
      route: '/manager/invitations',
      bg: 'bg-safebus-blue-light',
      hover: 'hover:bg-safebus-blue',
    },
  ];

  return (
    <Layout title="Painel de Gestor">
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-safebus-blue via-safebus-blue to-safebus-blue-dark rounded-2xl shadow-xl"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FBBF24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute top-0 right-0 w-80 h-80 bg-safebus-yellow/10 rounded-full -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-safebus-yellow rounded-2xl shadow-lg flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-safebus-blue" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Painel de Gestor</h1>
                  <p className="text-safebus-yellow font-semibold text-sm mt-0.5">Centro de controle SafeBus</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Calendar className="w-4 h-4 text-safebus-yellow" />
                  <span className="text-white text-sm font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                {user?.email && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-white/90 text-sm font-medium truncate max-w-[160px]">{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: 'Estudantes', value: stats.totalStudents, icon: Users, progress: 75, trend: '+12%', up: true, color: 'bg-safebus-blue' },
              { label: 'Responsáveis', value: stats.totalParents, icon: User, progress: 60, trend: '+8%', up: true, color: 'bg-safebus-yellow', textColor: 'text-safebus-blue' },
              { label: 'Motoristas', value: stats.totalDrivers, icon: Bus, progress: 45, trend: '-2%', up: false, color: 'bg-safebus-blue-light' },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (i + 1) }}
              >
                <Card className={`relative overflow-hidden ${kpi.color} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03]`}>
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-8 -mt-8" />
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className={`text-xs font-bold uppercase tracking-widest ${kpi.textColor || 'text-white/70'}`}>{kpi.label}</CardTitle>
                    <div className="p-2 bg-white/15 rounded-xl">
                      <kpi.icon className={`h-5 w-5 ${kpi.textColor || 'text-white'}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-4xl font-extrabold mb-2 ${kpi.textColor || 'text-white'}`}>{kpi.value}</div>
                    <div className="flex items-center gap-1.5 mb-3">
                      {kpi.up ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-300" />
                      )}
                      <span className={`text-sm font-semibold ${kpi.up ? 'text-emerald-300' : 'text-red-300'}`}>{kpi.trend} este mês</span>
                    </div>
                    <Progress value={kpi.progress} className="h-1.5 bg-white/20" />
                    <p className={`text-xs mt-1.5 ${kpi.textColor ? 'text-safebus-blue/60' : 'text-white/60'}`}>{kpi.progress}% da capacidade total</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-safebus-blue/10 shadow-sm p-1 rounded-xl w-full sm:w-auto">
              {[
                { value: 'gerenciamento', label: 'Gerenciamento' },
                { value: 'atividades', label: 'Atividades' },
                { value: 'relatorios', label: 'Relatórios' },
                { value: 'notificacoes', label: 'Notificações', badge: notifications.length },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative data-[state=active]:bg-safebus-blue data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 font-medium transition-all"
                >
                  {tab.label}
                  {tab.badge != null && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="gerenciamento">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="bg-white border border-safebus-blue/10 shadow-md">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-safebus-blue text-lg font-bold">Ações Rápidas</CardTitle>
                    <CardDescription className="text-gray-400">Gerencie utilizadores e configurações</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5 grid grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => navigate(action.route)}
                        className={`${action.bg} ${action.hover} ${action.textColor || 'text-white'} rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.04] hover:shadow-lg active:scale-[0.98] font-semibold text-sm`}
                      >
                        <div className="p-2 bg-white/20 rounded-lg">
                          <action.icon className="h-6 w-6" />
                        </div>
                        {action.label}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Alerts */}
                <Card className="bg-white border border-safebus-blue/10 shadow-md">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-safebus-blue text-lg font-bold">Alertas e Atualizações</CardTitle>
                    <CardDescription className="text-gray-400">Últimas notificações importantes</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-safebus-yellow/10 border border-safebus-yellow/30 rounded-xl hover:bg-safebus-yellow/15 transition-colors cursor-pointer group">
                      <div className="p-2 bg-safebus-yellow rounded-lg flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-safebus-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-safebus-blue text-sm">Atualização do Sistema</p>
                        <p className="text-xs text-gray-500">Nova versão disponível</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-safebus-blue/40 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                    <div
                      className="flex items-center gap-3 p-4 bg-safebus-blue/5 border border-safebus-blue/15 rounded-xl hover:bg-safebus-blue/10 transition-colors cursor-pointer group"
                      onClick={() => setActiveTab('atividades')}
                    >
                      <div className="p-2 bg-safebus-blue rounded-lg flex-shrink-0">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-safebus-blue text-sm">Atividade Recente</p>
                        <p className="text-xs text-gray-500">5 novos registros hoje</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-safebus-blue/40 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="p-2 bg-emerald-500 rounded-lg flex-shrink-0">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-emerald-700 text-sm">Todos os sistemas operacionais</p>
                        <p className="text-xs text-emerald-600/70">Última verificação: agora</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="atividades">
              <Card className="bg-white border border-safebus-blue/10 shadow-md">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-safebus-blue text-lg font-bold">Atividades Recentes</CardTitle>
                  <CardDescription className="text-gray-400">Acompanhe as últimas atividades do sistema</CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-safebus-blue"></div>
                      </div>
                    ) : recentActivities.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Activity className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">Nenhuma atividade registrada</p>
                      </div>
                    ) : (
                      recentActivities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.07 }}
                          className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-safebus-blue/20 hover:bg-safebus-blue/3 transition-all cursor-pointer group"
                        >
                          <div className="p-2 bg-safebus-blue/10 rounded-lg flex-shrink-0 group-hover:bg-safebus-blue/20 transition-colors">
                            <Activity className="h-4 w-4 text-safebus-blue" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{activity.action}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{activity.details}</p>
                            <p className="text-xs text-safebus-blue/60 mt-1 font-medium">
                              {new Date(activity.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:translate-x-1 group-hover:text-safebus-blue/50 transition-all flex-shrink-0 mt-1" />
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relatorios">
              <Card className="bg-white border border-safebus-blue/10 shadow-md">
                <CardHeader className="border-b border-gray-100 pb-4 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-safebus-blue text-lg font-bold">Relatórios e Métricas</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">Visualize dados e métricas importantes</CardDescription>
                  </div>
                  <GenerateWordDocument />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Growth Chart */}
                    <div>
                      <h3 className="text-sm font-bold text-safebus-blue uppercase tracking-widest mb-4">Crescimento — Últimos 7 Dias</h3>
                      <div className="h-[280px] bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={growthData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0.05} />
                              </linearGradient>
                              <linearGradient id="colorParents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.05} />
                              </linearGradient>
                              <linearGradient id="colorDrivers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2E4FA8" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#2E4FA8" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.75rem', boxShadow: '0 4px 20px rgb(0 0 0 / 0.08)', color: '#1E293B' }} />
                            <Area type="monotone" dataKey="students" stackId="1" stroke="#1E3A8A" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" name="Estudantes" />
                            <Area type="monotone" dataKey="parents" stackId="1" stroke="#FBBF24" strokeWidth={2} fillOpacity={1} fill="url(#colorParents)" name="Responsáveis" />
                            <Area type="monotone" dataKey="drivers" stackId="1" stroke="#2E4FA8" strokeWidth={2} fillOpacity={1} fill="url(#colorDrivers)" name="Motoristas" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pie Chart */}
                      <div>
                        <h3 className="text-sm font-bold text-safebus-blue uppercase tracking-widest mb-4">Distribuição de Utilizadores</h3>
                        <div className="h-[260px] bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={userDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={90}
                                dataKey="value"
                              >
                                {userDistribution.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={['#1E3A8A', '#FBBF24', '#2E4FA8', '#172E6E'][index % 4]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.75rem', boxShadow: '0 4px 20px rgb(0 0 0 / 0.08)' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <h3 className="text-sm font-bold text-safebus-blue uppercase tracking-widest mb-4">Resumo de Atividades</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-safebus-blue rounded-xl">
                            <span className="text-sm text-white/80 font-medium">Registros Hoje</span>
                            <span className="font-extrabold text-white text-lg">{growthData[growthData.length - 1]?.total || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-emerald-500 rounded-xl">
                            <span className="text-sm text-white/80 font-medium">Crescimento Semanal</span>
                            <span className="font-extrabold text-white text-lg">
                              {growthData.length > 0 && growthData[0].total > 0
                                ? `${((growthData[growthData.length - 1].total / growthData[0].total - 1) * 100).toFixed(1)}%`
                                : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-safebus-yellow rounded-xl">
                            <span className="text-sm text-safebus-blue/80 font-medium">Utilizadores Ativos</span>
                            <span className="font-extrabold text-safebus-blue text-lg">{userDistribution.reduce((acc, curr) => acc + curr.value, 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notificacoes">
              <Card className="bg-white border border-safebus-blue/10 shadow-md">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-safebus-blue text-lg font-bold">Notificações</CardTitle>
                  <CardDescription className="text-gray-400">Gerencie e acompanhe as notificações</CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">Nenhuma notificação de momento</p>
                      </div>
                    ) : (
                      notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.07 }}
                          className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-safebus-blue/20 hover:bg-safebus-blue/3 transition-all"
                        >
                          <div className="p-2 bg-safebus-blue/10 rounded-lg flex-shrink-0">
                            <Bell className="h-4 w-4 text-safebus-blue" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(notification.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-safebus-blue/60 hover:text-safebus-blue hover:bg-safebus-blue/5 text-xs flex-shrink-0"
                          >
                            Lida
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
