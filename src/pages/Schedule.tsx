
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { StopData } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Schedule = () => {
  const [stops, setStops] = useState<StopData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
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
      <div className="space-y-6">
        {/* Seletor de data */}
        <section className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => changeDate(-1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              &lt;
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Calendar size={16} className="mr-2" />
                <span className="font-semibold capitalize">
                  {formatDate(selectedDate)}
                </span>
              </div>
              {selectedDate.toDateString() === new Date().toDateString() && (
                <span className="text-xs bg-busapp-secondary text-busapp-dark px-2 py-0.5 rounded-full">
                  Hoje
                </span>
              )}
            </div>
            
            <button 
              onClick={() => changeDate(1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              &gt;
            </button>
          </div>
        </section>
        
        {/* Informação sobre horários */}
        <section className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg mb-2">Informações de Horário</h3>
          <p className="text-sm text-gray-600">
            Os autocarros operam de segunda a sexta-feira com os seguintes horários:
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex items-center">
              <Clock size={16} className="mr-2 text-busapp-primary" />
              <span>Reitoria da Mandume: <strong>07:30</strong></span>
            </li>
            <li className="flex items-center">
              <Clock size={16} className="mr-2 text-busapp-primary" />
              <span>Bairro do Tchioco: <strong>07:50</strong></span>
            </li>
          </ul>
        </section>
        
        {/* Lista de horários por parada */}
        <section>
          <h2 className="text-xl font-bold mb-4">Horários para {formatDate(selectedDate)}</h2>
          
          {isWeekend && (
            <Alert className="mb-4">
              <AlertTitle>Sem serviço</AlertTitle>
              <AlertDescription>
                Os autocarros não operam aos fins de semana. Por favor, selecione um dia útil (segunda a sexta-feira).
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-24" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stops.map((stop) => (
                <div 
                  key={stop.id} 
                  className="bg-white border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{stop.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {stop.address}
                      </p>
                      
                      <div className="mt-3 flex items-center">
                        <div className="mr-4">
                          <div className="text-xs uppercase text-gray-500 font-medium">Horário Previsto</div>
                          <div className="flex items-center mt-1">
                            <Clock size={14} className="text-busapp-primary mr-1" />
                            <span className="font-medium">{formatTime(stop.scheduledTime || '')}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs uppercase text-gray-500 font-medium">Horário Estimado</div>
                          <div className="flex items-center mt-1">
                            <Clock size={14} className={
                              stop.scheduledTime !== stop.estimatedTime 
                                ? "text-yellow-600 mr-1" 
                                : "text-green-600 mr-1"
                            } />
                            <span className={
                              stop.scheduledTime !== stop.estimatedTime
                                ? "font-medium text-yellow-600"
                                : "font-medium text-green-600"
                            }>
                              {formatTime(stop.estimatedTime || '')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      stop.scheduledTime !== stop.estimatedTime
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {stop.scheduledTime !== stop.estimatedTime ? "Atrasado" : "No horário"}
                    </div>
                  </div>
                </div>
              ))}
              
              {stops.length === 0 && !isWeekend && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum horário disponível para esta data.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Schedule;
