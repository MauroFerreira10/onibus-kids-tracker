import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CreditCard,
  Activity,
  BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface AdminDashboardData {
  totalUsers: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
  annualRevenue: number;
  churnRate: number;
  mrr: number;
  arr: number;
  recentSubscriptions: any[];
  revenueByPlan: any[];
}

const AdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // Fetch subscriptions
      const { data: subscriptions, count: totalSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      // Calculate revenue (converted to AOA - approximately 100 AOA per BRL)
      const monthlyRevenue = (subscriptions?.reduce((sum, sub) => {
        const plan = getPlanDetails(sub.plan_id);
        return sum + plan.monthlyPrice;
      }, 0) || 0) * 100;

      const annualRevenue = monthlyRevenue * 12;
      const mrr = monthlyRevenue;
      const arr = annualRevenue;

      // Mock data for charts (would come from analytics service)
      const revenueByPlan = [
        { name: 'Básico', value: monthlyRevenue * 0.4, color: '#3b82f6' },
        { name: 'Profissional', value: monthlyRevenue * 0.45, color: '#10b981' },
        { name: 'Empresarial', value: monthlyRevenue * 0.15, color: '#8b5cf6' }
      ];

      const recentSubscriptions = subscriptions?.slice(0, 5) || [];

      setData({
        totalUsers: totalUsers || 0,
        totalSubscriptions: totalSubscriptions || 0,
        monthlyRevenue,
        annualRevenue,
        churnRate: 2.5, // Mock data
        mrr,
        arr,
        recentSubscriptions,
        revenueByPlan
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanDetails = (planId: string) => {
    const plans: Record<string, { name: string; monthlyPrice: number }> = {
      'basic': { name: 'Básico', monthlyPrice: 9900 },
      'professional': { name: 'Profissional', monthlyPrice: 24900 },
      'enterprise': { name: 'Empresarial', monthlyPrice: 49900 }
    };
    return plans[planId] || { name: 'Unknown', monthlyPrice: 0 };
  };

  if (loading || !data) {
    return <div className="p-8">Carregando...</div>;
  }

  const stats = [
    {
      title: "Total de Usuários",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Assinaturas Ativas",
      value: data.totalSubscriptions.toLocaleString(),
      icon: CreditCard,
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Receita Mensal (MRR)",
      value: `Kz ${data.mrr.toLocaleString('pt-AO')}`,
      icon: DollarSign,
      change: "+15%",
      changeType: "positive"
    },
    {
      title: "Receita Anual (ARR)",
      value: `Kz ${data.arr.toLocaleString('pt-AO')}`,
      icon: TrendingUp,
      change: "+180%",
      changeType: "positive"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === '7d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('7d')}
          >
            7 dias
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('30d')}
          >
            30 dias
          </Button>
          <Button 
            variant={timeRange === '90d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('90d')}
          >
            90 dias
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} do período anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Receita por Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.revenueByPlan}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.revenueByPlan.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`Kz ${Number(value).toLocaleString('pt-AO')}`, 'Receita']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Financeiras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Taxa de Churn</span>
                  <Badge variant="destructive">{data.churnRate}%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Crescimento MRR</span>
                  <Badge variant="default">+15%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">LTV/CAC Ratio</span>
                  <Badge variant="default">4.2:1</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentSubscriptions.map((sub: any) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Nova assinatura - {getPlanDetails(sub.plan_id).name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      R$ {getPlanDetails(sub.plan_id).monthlyPrice}/mês
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;