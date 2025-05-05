
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock, CheckCircle } from 'lucide-react';
import { RouteData, StopData } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const Routes = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchRoutes();
  }, []);
  
  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      
      // Fetch routes from database
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('*');
      
      if (routesError) throw routesError;
      
      if (!routesData || routesData.length === 0) {
        setRoutes([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch stops for all routes
      const { data: stopsData, error: stopsError } = await supabase
        .from('stops')
        .select('*')
        .in('route_id', routesData.map(r => r.id))
        .order('sequence_number', { ascending: true });
      
      if (stopsError) throw stopsError;
      
      // Organize data into the expected format
      const mappedRoutes: RouteData[] = routesData.map(route => {
        // Find stops for this route
        const routeStops = stopsData?.filter(stop => stop.route_id === route.id) || [];
        
        return {
          id: route.id,
          name: route.name,
          description: route.description || 'Rota escolar',
          buses: [route.vehicle_id].filter(Boolean) as string[],
          stops: routeStops.map(stop => ({
            id: stop.id,
            name: stop.name,
            address: stop.address,
            latitude: stop.latitude || 0,
            longitude: stop.longitude || 0,
            scheduledTime: stop.estimated_time || '08:00',
            estimatedTime: stop.estimated_time || '08:00'
          })),
          schedule: {
            weekdays: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'],
            startTime: '07:00',
            endTime: '08:30'
          }
        };
      });
      
      setRoutes(mappedRoutes);
      
      // If the user is logged in, fetch their attendance status
      if (user) {
        fetchAttendanceStatus();
      }
    } catch (error) {
      console.error('Erro ao buscar rotas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as rotas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAttendanceStatus = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch the current user's student profile
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', user?.id)
        .maybeSingle();
      
      if (!studentData) return;
      
      // Fetch attendance status for today
      const { data: attendanceData, error } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('student_id', studentData.id)
        .eq('trip_date', today);
      
      if (error) {
        console.error('Error fetching attendance:', error);
        return;
      }
      
      if (attendanceData && attendanceData.length > 0) {
        const statusMap: Record<string, string> = {};
        
        attendanceData.forEach(record => {
          if (record.stop_id) {
            statusMap[record.stop_id] = record.status;
          }
        });
        
        setAttendanceStatus(statusMap);
      }
    } catch (error) {
      console.error('Erro ao buscar status de presença:', error);
    }
  };
  
  const markPresentAtStop = async (stopId: string) => {
    try {
      if (!user) {
        toast({
          title: "Atenção",
          description: "Você precisa estar logado para marcar presença.",
          variant: "default"
        });
        return;
      }
      
      // Get the student ID for the current user
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', user.id)
        .maybeSingle();
      
      if (!studentData) {
        toast({
          title: "Atenção",
          description: "Você não tem um perfil de aluno registrado.",
          variant: "default"
        });
        return;
      }
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Check if there's already a record for today
      const { data: existingRecord } = await supabase
        .from('student_attendance')
        .select('id, status')
        .eq('student_id', studentData.id)
        .eq('trip_date', today)
        .eq('stop_id', stopId)
        .maybeSingle();
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('student_attendance')
          .update({ 
            status: 'present_at_stop',
            marked_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('student_attendance')
          .insert({
            student_id: studentData.id,
            trip_date: today,
            stop_id: stopId,
            status: 'present_at_stop',
            marked_by: user.id
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setAttendanceStatus(prev => ({
        ...prev,
        [stopId]: 'present_at_stop'
      }));
      
      toast({
        title: "Sucesso",
        description: "Presença confirmada neste ponto de embarque!",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar presença. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-4">Rotas Ativas em Lubango</h2>
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
                      
                      <h4 className="font-semibold mb-2">Paradas em Lubango</h4>
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
                              
                              {user && (
                                <div className="mt-3 flex justify-end">
                                  {attendanceStatus[stop.id] === 'present_at_stop' ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Presença confirmada
                                    </Badge>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-busapp-primary border-busapp-primary/30"
                                      onClick={() => markPresentAtStop(stop.id)}
                                    >
                                      Confirmar presença neste ponto
                                    </Button>
                                  )}
                                </div>
                              )}
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
