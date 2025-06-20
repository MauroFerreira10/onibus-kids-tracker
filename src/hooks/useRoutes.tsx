import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RouteData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  fetchRoutesData, 
  fetchStopsForRoutes, 
  mapRoutesToDataFormat 
} from '@/services/routeService';
import { 
  fetchUserAttendanceStatus, 
  markUserPresenceAtStop 
} from '@/services/attendanceService';
import { subscribeToNotifications } from '@/services/notificationService';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        
        const routesData = await fetchRoutesData();
        
        if (!routesData || routesData.length === 0) {
          setRoutes([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch stops for all routes
        const stopsData = await fetchStopsForRoutes(routesData.map(r => r.id));
        
        // Organize data into the expected format
        const mappedRoutes = mapRoutesToDataFormat(routesData, stopsData);
        
        setRoutes(mappedRoutes);
        
        // If the user is logged in, fetch their attendance status
        if (user) {
          updateAttendanceStatus();
        }
      } catch (error) {
        console.error('Erro ao buscar rotas:', error);
        toast.error("Erro ao carregar rotas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();

    // Configurar subscrição para notificações
    const channel = subscribeToNotifications((notification) => {
      if (notification.type === 'trip_started') {
        toast.info(notification.message);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user, navigate]);

  const updateAttendanceStatus = async () => {
    try {
      if (!user) return;
      
      const statusMap = await fetchUserAttendanceStatus(user.id);
      setAttendanceStatus(statusMap);
    } catch (error) {
      console.error('Erro ao buscar status de presença:', error);
    }
  };

  const markPresentAtStop = async (stopId: string) => {
    try {
      if (!user) {
        toast.warning("Você precisa estar logado para marcar presença.");
        return;
      }
      
      console.log(`Marcando presença no ponto ${stopId} para o usuário ${user.id}`);
      
      // Get stop information to find the route_id
      const { data: stopData, error: stopError } = await supabase
        .from('stops')
        .select('route_id, name')
        .eq('id', stopId)
        .maybeSingle();
            
      if (stopError || !stopData) {
        console.error('Error fetching stop:', stopError);
        toast.error("Não foi possível obter informações sobre o ponto de embarque.");
        return;
      }
      
      await markUserPresenceAtStop(user.id, stopId, stopData);
      
      // Update local state
      setAttendanceStatus(prev => ({
        ...prev,
        [stopId]: 'present_at_stop'
      }));
      
      toast.success("Presença confirmada neste ponto de embarque!");
      
    } catch (error: any) {
      console.error('Erro ao marcar presença:', error);
      
      if (error.message === 'DUPLICATE_RECORD') {
        toast.info("Você já confirmou presença neste ponto hoje.");
        return;
      }
      
      toast.error("Ocorreu um problema ao registrar sua presença. Por favor, tente novamente mais tarde.");
    }
  };

  return {
    routes,
    isLoading,
    attendanceStatus,
    markPresentAtStop,
  };
};
