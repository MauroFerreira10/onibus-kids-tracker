export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'annual';
  limits: {
    students: number | 'unlimited';
    drivers: number | 'unlimited';
    routes: number | 'unlimited';
  };
  features: string[];
  stripe_price_id?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageMetrics {
  students_count: number;
  drivers_count: number;
  routes_count: number;
  notifications_sent: number;
  last_reset_date: string;
}

export interface BillingInfo {
  customer_id: string;
  payment_method_id?: string;
  card_brand?: string;
  card_last4?: string;
  expires_at?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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

export const FREE_TRIAL_DAYS = 14;