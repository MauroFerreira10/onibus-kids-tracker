
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RouteData } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useRoutes = () => {
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
      if (!user) return;
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Use a raw query to fetch attendance from the attendance_simple table
      // since it's not in the TypeScript definitions yet
      const { data: attendanceData, error } = await supabase
        .rpc('get_user_attendance_status', { 
          user_id_param: user.id,
          date_param: today
        });
      
      if (error) {
        console.error('Error fetching attendance:', error);
        return;
      }
      
      if (attendanceData && attendanceData.length > 0) {
        const statusMap: Record<string, string> = {};
        
        // Map each stop attendance status
        attendanceData.forEach((record: {stop_id: string}) => {
          statusMap[record.stop_id] = 'present_at_stop';
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
      
      console.log(`Marcando presença no ponto ${stopId} para o usuário ${user.id}`);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Get stop information to find the route_id
      const { data: stopData, error: stopError } = await supabase
        .from('stops')
        .select('route_id, name')
        .eq('id', stopId)
        .maybeSingle();
            
      if (stopError || !stopData) {
        console.error('Error fetching stop:', stopError);
        toast({
          title: "Erro",
          description: "Não foi possível obter informações sobre o ponto de embarque.",
          variant: "destructive"
        });
        return;
      }
      
      // Use a stored procedure to insert attendance record
      const { data, error: insertError } = await supabase
        .rpc('record_user_attendance', {
          user_id_param: user.id,
          stop_id_param: stopId,
          route_id_param: stopData.route_id,
          date_param: today
        });
      
      if (insertError) {
        console.error('Erro ao registrar presença:', insertError);
        
        // Check if it's a duplicate record error
        if (insertError.message.includes('duplicate key') || insertError.message.includes('already exists')) {
          toast({
            title: "Informação",
            description: "Você já confirmou presença neste ponto hoje.",
            variant: "default"
          });
          return;
        }
        
        toast({
          title: "Erro",
          description: "Não foi possível registrar sua presença. Por favor, tente novamente.",
          variant: "destructive"
        });
        return;
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
        description: "Ocorreu um problema ao registrar sua presença. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  return {
    routes,
    isLoading,
    attendanceStatus,
    markPresentAtStop,
  };
};
