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
      
      // Fetch stops from database
      const { data: stopsData, error } = await supabase
        .from('stops')
        .select('*')
        .order('sequence_number', { ascending: true });
      
      if (error) {
        console.error("Erro ao buscar paradas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as paradas.",
          variant: "destructive"
        });
        setStops([]);
        return;
      }
      
      // Add the specific time schedules for the stops
      const formattedStops = stopsData.map(stop => ({
        id: stop.id,
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude || 0,
        longitude: stop.longitude || 0,
        scheduledTime: getScheduledTimeForStop(stop.name),
        estimatedTime: getEstimatedTimeForStop(stop.name)
      }));
      
      setStops(formattedStops);
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um problema ao carregar os horários.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get scheduled time based on stop name
  const getScheduledTimeForStop = (stopName: string): string => {
    if (stopName.toLowerCase().includes('reitoria') || 
        stopName.toLowerCase().includes('mandume')) {
      return '07:30';
    } else if (stopName.toLowerCase().includes('tchioco')) {
      return '07:50';
    } else {
      return '07:40'; // Default time for other stops
    }
  };
  
  // Helper function to get estimated time (could be different from scheduled in real app)
  const getEstimatedTimeForStop = (stopName: string): string => {
    // For now, return the same time as scheduled
    return getScheduledTimeForStop(stopName);
  };
  
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
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-busapp-primary to-busapp-secondary rounded-2xl p-6 text-white shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-2">Horários do Ônibus</h1>
          <p className="text-white/80">Acompanhe em tempo real a localização e horários das paradas</p>
        </motion.div>

        {/* Date Selector */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <button 
              onClick={() => changeDate(-1)}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5 text-busapp-primary" />
                <span className="text-xl font-semibold capitalize">
                  {formatDate(selectedDate)}
                </span>
              </div>
              {selectedDate.toDateString() === new Date().toDateString() && (
                <span className="inline-block mt-2 text-sm bg-white/20 text-busapp-primary px-3 py-1 rounded-full">
                  Hoje
                </span>
              )}
            </div>
            
            <button 
              onClick={() => changeDate(1)}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </motion.section>

        {/* Schedule Information */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Bus className="w-6 h-6 text-busapp-primary" />
            <h3 className="text-xl font-semibold">Informações de Horário</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Horários Principais</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-busapp-primary rounded-full"></div>
                  <span>Reitoria da Mandume: <strong>07:30</strong></span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-busapp-primary rounded-full"></div>
                  <span>Bairro do Tchioco: <strong>07:50</strong></span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Status do Serviço</h4>
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Serviço em operação normal</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stops List */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Horários para {formatDate(selectedDate)}</h2>
          
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
                <Skeleton key={i} className="w-full h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {stops.map((stop, index) => (
                  <motion.div
                    key={stop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
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
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-500 mb-1">Horário Previsto</div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-busapp-primary mr-2" />
                              <span className="font-medium">{formatTime(stop.scheduledTime || '')}</span>
                            </div>
                          </div>
                          
                          <div className={cn(
                            "rounded-lg p-3",
                            stop.scheduledTime !== stop.estimatedTime
                              ? "bg-yellow-50"
                              : "bg-green-50"
                          )}>
                            <div className="text-sm text-gray-500 mb-1">Horário Estimado</div>
                            <div className="flex items-center">
                              <Clock className={cn(
                                "w-4 h-4 mr-2",
                                stop.scheduledTime !== stop.estimatedTime
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              )} />
                              <span className={cn(
                                "font-medium",
                                stop.scheduledTime !== stop.estimatedTime
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              )}>
                                {formatTime(stop.estimatedTime || '')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2",
                        stop.scheduledTime !== stop.estimatedTime
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
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
                  className="text-center py-12 bg-gray-50 rounded-xl"
                >
                  <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum horário disponível para esta data.</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.section>
      </div>
    </Layout>
  );
};

export default Schedule;
