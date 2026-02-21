import { supabase } from '@/integrations/supabase/client';
import { UserSubscription, SubscriptionPlan, UsageMetrics, BillingInfo } from '@/types/subscription';
import { FREE_TRIAL_DAYS } from '@/types/subscription';

export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  static async createUserSubscription(
    userId: string,
    planId: string,
    customerId: string
  ): Promise<UserSubscription> {
    try {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + FREE_TRIAL_DAYS);

      const subscriptionData = {
        user_id: userId,
        plan_id: planId,
        status: 'trialing',
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndsAt.toISOString(),
        trial_ends_at: trialEndsAt.toISOString()
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user subscription:', error);
      throw error;
    }
  }

  static async updateUserSubscription(
    subscriptionId: string,
    updates: Partial<UserSubscription>
  ): Promise<UserSubscription> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'canceled',
          current_period_end: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  static async getUsageMetrics(userId: string): Promise<UsageMetrics> {
    try {
      // Get student count
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('role', 'student');

      // Get driver count
      const { count: driversCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('role', 'driver');

      // Get routes count
      const { count: routesCount } = await supabase
        .from('routes')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', userId);

      // Get notifications sent (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('sender_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        students_count: studentsCount || 0,
        drivers_count: driversCount || 0,
        routes_count: routesCount || 0,
        notifications_sent: notificationsCount || 0,
        last_reset_date: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting usage metrics:', error);
      return {
        students_count: 0,
        drivers_count: 0,
        routes_count: 0,
        notifications_sent: 0,
        last_reset_date: new Date().toISOString()
      };
    }
  }

  static async checkQuotaLimits(
    userId: string,
    planId: string
  ): Promise<{ exceeded: boolean; metric: string | null }> {
    try {
      const usage = await this.getUsageMetrics(userId);
      const plan = this.getPlanById(planId);
      
      if (!plan) {
        return { exceeded: true, metric: 'invalid_plan' };
      }

      // Check student limit
      if (plan.limits.students !== 'unlimited' && usage.students_count >= plan.limits.students) {
        return { exceeded: true, metric: 'students' };
      }

      // Check driver limit
      if (plan.limits.drivers !== 'unlimited' && usage.drivers_count >= plan.limits.drivers) {
        return { exceeded: true, metric: 'drivers' };
      }

      // Check route limit
      if (plan.limits.routes !== 'unlimited' && usage.routes_count >= plan.limits.routes) {
        return { exceeded: true, metric: 'routes' };
      }

      return { exceeded: false, metric: null };
    } catch (error) {
      console.error('Error checking quota limits:', error);
      return { exceeded: false, metric: null };
    }
  }

  static getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.getAllPlans().find(plan => plan.id === planId);
  }

  static getAllPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: 'Básico',
        price: 9900,
        period: 'monthly',
        limits: {
          students: 50,
          drivers: 5,
          routes: 10
        },
        features: [
          'Cadastro de até 50 alunos',
          'Gerenciamento de 5 motoristas',
          'Criação de 10 rotas',
          'Notificações básicas',
          'Relatórios simples',
          'Suporte por email'
        ]
      },
      {
        id: 'professional',
        name: 'Profissional',
        price: 24900,
        period: 'monthly',
        limits: {
          students: 200,
          drivers: 20,
          routes: 50
        },
        features: [
          'Cadastro de até 200 alunos',
          'Gerenciamento de 20 motoristas',
          'Criação de 50 rotas',
          'Notificações avançadas',
          'Relatórios detalhados',
          'Suporte prioritário',
          'Integração com sistemas escolares',
          'Exportação de dados (PDF/Excel)'
        ]
      },
      {
        id: 'enterprise',
        name: 'Empresarial',
        price: 49900,
        period: 'monthly',
        limits: {
          students: 'unlimited',
          drivers: 'unlimited',
          routes: 'unlimited'
        },
        features: [
          'Alunos ilimitados',
          'Motoristas ilimitados',
          'Rotas ilimitadas',
          'Todas as funcionalidades',
          'Suporte 24/7',
          'Personalização avançada',
          'API para integrações',
          'White-label disponível',
          'Treinamento dedicado',
          'SLA garantido'
        ]
      }
    ];
  }

  static async createBillingCustomer(email: string, name: string): Promise<BillingInfo> {
    try {
      // This would integrate with Stripe/PayPal
      // For now, returning mock data
      return {
        customer_id: `cus_${Math.random().toString(36).substr(2, 9)}`,
        card_brand: 'Visa',
        card_last4: '4242'
      };
    } catch (error) {
      console.error('Error creating billing customer:', error);
      throw error;
    }
  }

  static async createSubscriptionPayment(
    customerId: string,
    priceId: string,
    subscriptionId: string
  ): Promise<any> {
    try {
      // This would integrate with Stripe/PayPal
      // Mock implementation
      return {
        id: `sub_${Math.random().toString(36).substr(2, 9)}`,
        status: 'active'
      };
    } catch (error) {
      console.error('Error creating subscription payment:', error);
      throw error;
    }
  }
}