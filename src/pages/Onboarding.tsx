import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  User, 
  MapPin, 
  Bell,
  ArrowRight,
  Play,
  BookOpen,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionService } from '@/services/subscriptionService';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao SafeBus!',
      subtitle: 'Vamos configurar sua conta para começar a usar o sistema',
      icon: User,
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold">Comece sua jornada conosco</h3>
          <p className="text-gray-600">
            Nos próximos passos, vamos te ajudar a configurar seu perfil, 
            adicionar seus primeiros alunos e começar a usar todas as funcionalidades.
          </p>
          <Badge variant="secondary" className="text-sm">
            Período de teste: 14 dias grátis
          </Badge>
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Complete seu Perfil',
      subtitle: 'Configure suas informações básicas',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span>Nome da instituição</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span>Endereço e contato</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span>Informações do responsável</span>
          </div>
        </div>
      )
    },
    {
      id: 'students',
      title: 'Adicione Seus Primeiros Alunos',
      subtitle: 'Comece cadastrando alguns alunos para testar o sistema',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Dica para começar:</h4>
            <p className="text-sm text-gray-600">
              Cadastre 3-5 alunos fictícios para testar todas as funcionalidades. 
              Você pode editar ou remover depois.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cadastro Rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">Adicione alunos manualmente</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Importação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">Importe de planilha Excel</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Convites</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">Envie convites por email</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'routes',
      title: 'Configure Rotas de Transporte',
      subtitle: 'Defina as rotas que seus veículos irão percorrer',
      icon: MapPin,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Próximo passo importante</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Após cadastrar alunos, configure as rotas para que eles possam 
                  ser associados aos percursos corretos.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Rotas Básicas:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Rota Matutina</li>
                <li>• Rota Vespertina</li>
                <li>• Rota Extra</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Recursos disponíveis:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Múltiplas paradas</li>
                <li>• Horários personalizados</li>
                <li>• Integração com mapa</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Explore as Funcionalidades',
      subtitle: 'Conheça as principais ferramentas do SafeBus',
      icon: Play,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <CardTitle>Notificações</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Receba alertas em tempo real sobre chegadas, atrasos e eventos importantes.
              </p>
              <Button variant="outline" size="sm">
                Ver demonstração
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <CardTitle>Relatórios</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Gere relatórios completos de frequência, rotas e desempenho.
              </p>
              <Button variant="outline" size="sm">
                Ver amostra
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <CardTitle>Agendamento</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Gerencie horários, feriados e exceções no calendário escolar.
              </p>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-600" />
                <CardTitle>Comunicação</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Chat integrado para comunicação entre pais, motoristas e gestores.
              </p>
              <Button variant="outline" size="sm">
                Testar chat
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Você está pronto!',
      subtitle: 'Comece a usar o SafeBus hoje mesmo',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Parabéns! Sua configuração está concluída.
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Agora você pode começar a usar todas as funcionalidades do SafeBus. 
              Se precisar de ajuda, nossa equipe de suporte está disponível 24/7 durante o período de teste.
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg max-w-md mx-auto">
            <h4 className="font-semibold text-blue-900 mb-2">Próximos passos recomendados:</h4>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Adicione todos os seus alunos</li>
              <li>• Configure os motoristas</li>
              <li>• Crie as rotas completas</li>
              <li>• Convide pais/responsáveis</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Track progress
      if (user) {
        // Analytics tracking would go here
      }
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsCompleting(true);
      
      if (user) {
        // Mark onboarding as completed in user profile
        await SubscriptionService.updateUserSubscription(
          user.id,
          { status: 'active' }
        );
      }
      
      // Navigate to dashboard
      navigate('/manager/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Configuração Inicial</h1>
            <span className="text-sm text-gray-600">
              Passo {currentStep + 1} de {steps.length}
            </span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Step content */}
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-base">
              {currentStepData.subtitle}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8">
            {currentStepData.content}
          </CardContent>
          
          {/* Navigation buttons */}
          <div className="flex justify-between p-6 bg-gray-50 rounded-b-lg">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Voltar
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isCompleting}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Começar a usar
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  Próximo passo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Skip option */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/manager/dashboard')}
            className="text-gray-500 hover:text-gray-700"
          >
            Pular configuração e ir para o painel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;