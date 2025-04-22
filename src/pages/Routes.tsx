
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { generateMockRoutes, generateMockStops } from '@/services/mockData';
import { RouteData, StopData } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock } from 'lucide-react';

const Routes = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [stops, setStops] = useState<StopData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setRoutes(generateMockRoutes());
      setStops(generateMockStops());
      setIsLoading(false);
    }, 1000);
  }, []);
  
  return (
    <Layout>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-4">Rotas Ativas</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-16" />
              ))}
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {routes.map((route) => (
                <AccordionItem key={route.id} value={route.id}>
                  <AccordionTrigger className="hover:bg-gray-50 px-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-busapp-primary rounded-full mr-3">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                        >
                          <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
                          <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                          <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold">{route.name}</h3>
                        <p className="text-gray-600 text-sm">{route.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-4 pr-2 py-2">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-1">Horários</h4>
                        <p className="text-gray-600 text-sm">
                          <Clock size={14} className="inline mr-1" />
                          {route.schedule.startTime} - {route.schedule.endTime}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          Dias: {route.schedule.weekdays.map(day => 
                            day.charAt(0).toUpperCase() + day.slice(1)
                          ).join(', ')}
                        </p>
                      </div>
                      
                      <h4 className="font-semibold mb-2">Paradas</h4>
                      <ul className="space-y-4">
                        {route.stops.map((stop, index) => (
                          <li key={stop.id} className="relative pl-6">
                            {/* Linha vertical conectando as paradas */}
                            {index < route.stops.length - 1 && (
                              <div className="absolute left-[0.65rem] top-6 w-0.5 h-full bg-gray-300 -z-10"></div>
                            )}
                            
                            {/* Marcador da parada */}
                            <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 border-busapp-primary bg-white flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-busapp-primary"></div>
                            </div>
                            
                            <div className="bg-white border rounded-lg shadow-sm p-3">
                              <h5 className="font-semibold">{stop.name}</h5>
                              <p className="text-gray-600 text-sm flex items-center mt-1">
                                <MapPin size={14} className="mr-1" />
                                {stop.address}
                              </p>
                              
                              <div className="flex justify-between items-center mt-2 text-sm">
                                <div className="text-gray-500">
                                  <span>Horário planejado:</span>
                                  <span className="ml-1 font-medium">{stop.scheduledTime}</span>
                                </div>
                                
                                {stop.scheduledTime !== stop.estimatedTime && (
                                  <div className="text-yellow-600">
                                    <span>Estimado:</span>
                                    <span className="ml-1 font-medium">{stop.estimatedTime}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          {!isLoading && routes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma rota disponível</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Routes;
