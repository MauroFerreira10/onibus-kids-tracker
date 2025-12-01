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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Header Section com glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20"
          >
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Horários do Ônibus
            </h1>
            <p className="text-gray-600">Acompanhe em tempo real a localização e horários das paradas</p>
          </motion.div>

          {/* Date Selector com glassmorphism */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => changeDate(-1)}
                className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-md hover:bg-white/80 transition-all shadow-sm border border-white/40 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-xl font-semibold capitalize text-gray-900">
                    {formatDate(selectedDate)}
                  </span>
                </div>
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <span className="inline-block text-xs font-medium bg-blue-100/80 backdrop-blur-sm text-blue-700 px-3 py-1.5 rounded-full border border-blue-200/50">
                    Hoje
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => changeDate(1)}
                className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-md hover:bg-white/80 transition-all shadow-sm border border-white/40 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </motion.section>

        {/* Schedule Information com glassmorphism */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-white/80 backdrop-blur-sm rounded-xl">
              <Bus className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Informações de Horário</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-sm">
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
            
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-sm">
              <h4 className="font-semibold mb-3 text-gray-900">Status do Serviço</h4>
              {stops.length > 0 ? (
                <div className="space-y-2">
                  {stops.some(s => s.scheduledTime === s.estimatedTime) ? (
                    <div className="flex items-center space-x-2 text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Serviço no horário</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-yellow-700">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
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

        {/* Stops List com glassmorphism */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Horários para {formatDate(selectedDate)}</h2>
          
          {isWeekend && (
            <Alert className="mb-6 border-red-200/50 bg-red-50/80 backdrop-blur-md rounded-2xl border">
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
                <Skeleton key={i} className="w-full h-32 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {stops.map((stop, index) => (
                  <motion.div
                    key={stop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/20 hover:shadow-xl hover:scale-[1.01] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold">{stop.name}</h3>
                          <p className="text-gray-600 flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1 text-busapp-primary" />
                            {stop.address}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-sm">
                            <div className="text-xs font-medium text-gray-500 mb-2">Horário Previsto</div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="font-semibold text-gray-900">{formatTime(stop.scheduledTime || '')}</span>
                            </div>
                          </div>
                          
                          <div className={cn(
                            "rounded-2xl p-4 border shadow-sm backdrop-blur-md",
                            stop.scheduledTime !== stop.estimatedTime
                              ? "bg-yellow-50/80 border-yellow-200/50"
                              : "bg-green-50/80 border-green-200/50"
                          )}>
                            <div className="text-xs font-medium text-gray-500 mb-2">Horário Estimado</div>
                            <div className="flex items-center">
                              <Clock className={cn(
                                "w-4 h-4 mr-2",
                                stop.scheduledTime !== stop.estimatedTime
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              )} />
                              <span className={cn(
                                "font-semibold",
                                stop.scheduledTime !== stop.estimatedTime
                                  ? "text-yellow-700"
                                  : "text-green-700"
                              )}>
                                {formatTime(stop.estimatedTime || '')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm font-medium flex items-center space-x-2 backdrop-blur-md border shadow-sm",
                        stop.scheduledTime !== stop.estimatedTime
                          ? "bg-yellow-100/80 text-yellow-800 border-yellow-200/50"
                          : "bg-green-100/80 text-green-800 border-green-200/50"
                      )}>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          stop.scheduledTime !== stop.estimatedTime
                            ? "bg-yellow-600"
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
                  className="text-center py-12 bg-white/60 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm"
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
