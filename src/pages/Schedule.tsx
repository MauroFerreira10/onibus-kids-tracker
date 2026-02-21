import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { StopData } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Bus, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fetchStopsWithStatus } from '@/services/scheduleService';

const Schedule = () => {
  const [stops, setStops] = useState<StopData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const { toast } = useToast();
  
  useEffect(() => {
    fetchStops();
  }, [selectedDate]);
  
  const fetchStops = async () => {
    try {
      setIsLoading(true);
      
      // Get day of the week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = selectedDate.getDay();
      
      // Only show stops on weekdays (Monday-Friday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setStops([]);
        setIsLoading(false);
        return;
      }
      
      // Buscar paradas com verificação de status de horário
      const stopsWithStatus = await fetchStopsWithStatus();
      setStops(stopsWithStatus);
    } catch (error) {
      console.error("Erro:", error);
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
          {/* Header Section - design profissional */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
          >
            <div className="mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">Horários do Transporte</h1>
              <p className="text-gray-600 mt-1">Acompanhe em tempo real a localização e horários das paradas</p>
            </div>
          </motion.div>

          {/* Date Selector */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => changeDate(-1)}
                className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-xl font-semibold capitalize text-gray-900">
                    {formatDate(selectedDate)}
                  </span>
                </div>
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <span className="inline-block text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                    Hoje
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => changeDate(1)}
                className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </motion.section>

        {/* Schedule Information */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Bus className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Informações de Horário</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold mb-3 text-gray-900">Horários Principais</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Reitoria da Mandume: <strong className="text-gray-900">07:30</strong></span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Bairro do Tchioco: <strong className="text-gray-900">07:50</strong></span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold mb-3 text-gray-900">Status do Serviço</h4>
              {stops.length > 0 ? (
                <div className="space-y-2">
                  {stops.some(s => s.scheduledTime === s.estimatedTime) ? (
                    <div className="flex items-center space-x-2 text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Serviço no horário</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-700">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Serviço com atrasos</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Status baseado na localização e horário atual do motorista
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="font-medium">Sem dados disponíveis</span>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Stops List */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Horários para {formatDate(selectedDate)}</h2>
          
          {isWeekend && (
            <Alert className="mb-6 border-red-200 bg-red-50 rounded-xl">
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
                <Skeleton key={i} className="w-full h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {stops.map((stop, index) => (
                  <motion.div
                    key={stop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{stop.name}</h3>
                          <p className="text-gray-600 flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                            {stop.address}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="text-xs font-medium text-gray-500 mb-2">Horário Previsto</div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-600 mr-2" />
                              <span className="font-semibold text-gray-900">{formatTime(stop.scheduledTime || '')}</span>
                            </div>
                          </div>
                          
                          <div className={cn(
                            "rounded-lg p-4 border",
                            stop.scheduledTime !== stop.estimatedTime
                              ? "bg-amber-50 border-amber-200"
                              : "bg-green-50 border-green-200"
                          )}>
                            <div className="text-xs font-medium text-gray-500 mb-2">Horário Estimado</div>
                            <div className="flex items-center">
                              <Clock className={cn(
                                "w-4 h-4 mr-2",
                                stop.scheduledTime !== stop.estimatedTime
                                  ? "text-amber-600"
                                  : "text-green-600"
                              )} />
                              <span className={cn(
                                "font-semibold",
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
                        "px-4 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 border",
                        stop.scheduledTime !== stop.estimatedTime
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      )}>
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
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {stops.length === 0 && !isWeekend && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm"
                >
                  <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum horário disponível para esta data.</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
