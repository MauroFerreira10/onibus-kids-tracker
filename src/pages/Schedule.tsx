import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { StopData } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Bus, AlertCircle, CheckCircle2, Timer, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fetchStopsWithStatus } from '@/services/scheduleService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Schedule = () => {
  const [stops, setStops] = useState<StopData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();
  
  useEffect(() => {
    fetchStops();
  }, [selectedDate]);
  
  const fetchStops = async () => {
    try {
      setIsLoading(true);
      setDebugInfo('Iniciando carregamento...');
      
      // Get day of the week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = selectedDate.getDay();
      setDebugInfo(`Dia da semana: ${dayOfWeek} (${dayOfWeek === 0 ? 'Domingo' : dayOfWeek === 6 ? 'Sábado' : 'Dia útil'})`);
      
      // Only show stops on weekdays (Monday-Friday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setStops([]);
        setIsLoading(false);
        return;
      }
      
      setDebugInfo('Buscando paradas no banco de dados...');
      
      // Buscar paradas com verificação de status de horário
      const stopsWithStatus = await fetchStopsWithStatus();
      setDebugInfo(`Paradas encontradas: ${stopsWithStatus.length}`);
      setStops(stopsWithStatus);
      
      if (stopsWithStatus.length === 0) {
        toast({
          title: "Nenhum horário encontrado",
          description: "Verifique se existem paradas cadastradas no sistema.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erro:", error);
      setDebugInfo(`Erro: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erro",
        description: "Ocorreu um problema ao carregar os horários.",
        variant: "destructive"
      });
      setStops([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Limpar confirmações expiradas periodicamente
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        await supabase.rpc('cleanup_expired_attendance');
      } catch (error) {
        console.error('Erro ao limpar confirmações expiradas:', error);
      }
    }, 60000); // A cada minuto
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };
  
  const formatTime = (timeStr: string) => {
    return timeStr;
  };
  
  // Função para mudar a data selecionada
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };
  
  // Check if selected date is a weekend
  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Header Section - Clean and professional */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-safebus-blue/10 rounded-lg">
                <Bus className="w-6 h-6 text-safebus-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Horários do Transporte</h1>
                <p className="text-sm text-gray-600 mt-1">Acompanhe em tempo real a localização e horários das paradas</p>
              </div>
            </div>
            
            {/* Debug info (temporary) */}
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 text-xs font-mono">{debugInfo}</p>
              </div>
            )}
          </div>

          {/* Stats Cards - Simple and clean */}
          {!isLoading && stops.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-safebus-blue" />
                    Total de Paradas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-gray-900">{stops.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Todas as paradas da rota</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    No Horário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-green-700">
                    {stops.filter(s => s.scheduledTime === s.estimatedTime).length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Paradas no horário previsto</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Timer className="w-4 h-4 mr-2 text-amber-600" />
                    Com Atraso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-amber-700">
                    {stops.filter(s => s.scheduledTime !== s.estimatedTime).length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Paradas com atraso</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Date Selector - Simple */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => changeDate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-lg font-medium capitalize text-gray-900">
                    {formatDate(selectedDate)}
                  </span>
                </div>
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    Hoje
                  </Badge>
                )}
                {isWeekend && (
                  <Badge variant="destructive" className="mt-2">
                    Fim de Semana
                  </Badge>
                )}
              </div>
              
              <button 
                onClick={() => changeDate(1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

        {/* Schedule Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Informações de Horário</h3>
            <p className="text-sm text-gray-600 mt-1">Visão geral dos horários principais</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-3 text-gray-900 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-600" />
                Horários Principais
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Reitoria da Mandume</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">07:30</Badge>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Bairro do Tchioco</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">07:50</Badge>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-3 text-gray-900 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-gray-600" />
                Status do Serviço
              </h4>
              {stops.length > 0 ? (
                <div className="space-y-2">
                  {stops.some(s => s.scheduledTime === s.estimatedTime) ? (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 font-medium">Serviço no horário</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-amber-700 font-medium">Serviço com atrasos</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Status baseado na localização e horário atual do motorista
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Sem dados disponíveis</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stops List */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Horários para {formatDate(selectedDate)}</h2>
            {stops.length > 0 && (
              <Badge variant="outline" className="text-gray-600">
                {stops.length} {stops.length === 1 ? 'parada' : 'paradas'}
              </Badge>
            )}
          </div>
          
          {isWeekend && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Sem serviço</AlertTitle>
              <AlertDescription className="text-red-700">
                Os autocarros não operam aos fins de semana. Por favor, selecione um dia útil.
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-32" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="font-medium text-gray-900">{stop.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          {stop.address}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded p-3 border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Horário Previsto</div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-600 mr-2" />
                            <span className="font-medium text-gray-900">{formatTime(stop.scheduledTime || '')}</span>
                          </div>
                        </div>
                        
                        <div className={cn(
                          "rounded p-3 border",
                          stop.scheduledTime !== stop.estimatedTime
                            ? "bg-amber-50 border-amber-200"
                            : "bg-green-50 border-green-200"
                        )}>
                          <div className="text-xs text-gray-500 mb-1">Horário Estimado</div>
                          <div className="flex items-center">
                            <Clock className={cn(
                              "w-4 h-4 mr-2",
                              stop.scheduledTime !== stop.estimatedTime
                                ? "text-amber-600"
                                : "text-green-600"
                            )} />
                            <span className={cn(
                              "font-medium",
                              stop.scheduledTime !== stop.estimatedTime
                                ? "text-amber-700"
                                : "text-green-700"
                            )}>
                              {formatTime(stop.estimatedTime || '')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "px-3 py-2 rounded text-xs font-medium border",
                      stop.scheduledTime !== stop.estimatedTime
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-green-100 text-green-800 border-green-200"
                    )}>
                      <div className="flex items-center space-x-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          stop.scheduledTime !== stop.estimatedTime
                            ? "bg-amber-600"
                            : "bg-green-600"
                        )} />
                        <span>
                          {stop.scheduledTime !== stop.estimatedTime ? "Atrasado" : "No horário"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {stops.length === 0 && !isWeekend && (
                <div className="text-center py-12">
                  <Bus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhum horário disponível para esta data.</p>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
