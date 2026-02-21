import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Users, Bus, MapPin, Bell, FileText, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: "Básico",
      price: billingCycle === 'monthly' ? 9900 : 99000,
      period: billingCycle === 'monthly' ? '/mês' : '/ano',
      description: "Perfeito para pequenas instituições",
      featured: false,
      limits: {
        students: 50,
        drivers: 5,
        routes: 10
      },
      features: [
        "Cadastro de até 50 alunos",
        "Gerenciamento de 5 motoristas",
        "Criação de 10 rotas",
        "Notificações básicas",
        "Relatórios simples",
        "Suporte por email"
      ]
    },
    {
      name: "Profissional",
      price: billingCycle === 'monthly' ? 24900 : 249000,
      period: billingCycle === 'monthly' ? '/mês' : '/ano',
      description: "Ideal para instituições em crescimento",
      featured: true,
      limits: {
        students: 200,
        drivers: 20,
        routes: 50
      },
      features: [
        "Cadastro de até 200 alunos",
        "Gerenciamento de 20 motoristas",
        "Criação de 50 rotas",
        "Notificações avançadas",
        "Relatórios detalhados",
        "Suporte prioritário",
        "Integração com sistemas escolares",
        "Exportação de dados (PDF/Excel)"
      ]
    },
    {
      name: "Empresarial",
      price: billingCycle === 'monthly' ? 49900 : 499000,
      period: billingCycle === 'monthly' ? '/mês' : '/ano',
      description: "Solução completa para grandes instituições",
      featured: false,
      limits: {
        students: "Ilimitados",
        drivers: "Ilimitados",
        routes: "Ilimitadas"
      },
      features: [
        "Alunos ilimitados",
        "Motoristas ilimitados",
        "Rotas ilimitadas",
        "Todas as funcionalidades",
        "Suporte 24/7",
        "Personalização avançada",
        "API para integrações",
        "White-label disponível",
        "Treinamento dedicado",
        "SLA garantido"
      ]
    }
  ];

  const savings = billingCycle === 'annual' ? Math.round((1 - 990/1188) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            <Star className="w-4 h-4 mr-1" />
            Solução Completa de Transporte Escolar
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planos que crescem com sua instituição
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Escolha o plano perfeito para suas necessidades de transporte escolar. 
            Todos incluem rastreamento em tempo real, notificações e relatórios completos.
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex justify-center items-center space-x-4">
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative rounded-full w-14 h-7 bg-blue-600 transition-colors"
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
            <span className={`font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
            {billingCycle === 'annual' && (
              <Badge variant="destructive" className="ml-2">
                Economize {savings}%
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`relative overflow-hidden ${
                plan.featured 
                  ? 'ring-2 ring-blue-500 shadow-xl scale-105' 
                  : 'shadow-lg hover:shadow-xl transition-shadow'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    MAIS POPULAR
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    Kz {plan.price.toLocaleString('pt-AO')}
                  </span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                
                {billingCycle === 'annual' && (
                  <p className="text-sm text-green-600 mt-2">
                    Equivalente a Kz {(plan.price/12).toFixed(0)}/mês
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Limites do Plano:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Alunos: {plan.limits.students}</span>
                    </div>
                    <div className="flex items-center">
                      <Bus className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Motoristas: {plan.limits.drivers}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Rotas: {plan.limits.routes}</span>
                    </div>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.featured 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
                  size="lg"
                >
                  Começar Agora
                </Button>
              </CardFooter>
            </Card>
          ))}
        </motion.div>

        {/* Features Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Todos os planos incluem:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Rastreamento em Tempo Real</h3>
              <p className="text-sm text-gray-600">Localização precisa dos veículos</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Notificações Instantâneas</h3>
              <p className="text-sm text-gray-600">Alertas de chegada e atrasos</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Relatórios Completos</h3>
              <p className="text-sm text-gray-600">Análises e métricas detalhadas</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Segurança Garantida</h3>
              <p className="text-sm text-gray-600">Dados protegidos e criptografados</p>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funciona o período de teste?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Oferecemos 14 dias gratuitos para você testar todas as funcionalidades. 
                  Não é necessário cartão de crédito.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso mudar de plano a qualquer momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As alterações são aplicadas imediatamente.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Há taxas adicionais por uso?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Não. O preço do plano é fixo independente do número de usuários ativos, 
                  dentro dos limites estabelecidos.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;