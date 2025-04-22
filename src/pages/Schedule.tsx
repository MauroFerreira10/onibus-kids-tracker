
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BusData, StopData } from '@/types';
import { generateMockStops } from '@/services/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock } from 'lucide-react';

const Schedule = () => {
  const [stops, setStops] = useState<StopData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStops(generateMockStops());
      setIsLoading(false);
    }, 1000);
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
        
        {/* Lista de horários por parada */}
        <section>
          <h2 className="text-xl font-bold mb-4">Horários para {formatDate(selectedDate)}</h2>
          
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
                      <p className="text-sm text-gray-600">{stop.address}</p>
                      
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
              
              {stops.length === 0 && (
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
