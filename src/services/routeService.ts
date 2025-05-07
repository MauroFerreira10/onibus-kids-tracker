
import { supabase } from '@/integrations/supabase/client';
import { RouteData, StopData } from '@/types';

/**
 * Fetches all route data from the database
 */
export const fetchRoutesData = async () => {
  // Fetch routes from database
  const { data: routesData, error: routesError } = await supabase
    .from('routes')
    .select('*');
  
  if (routesError) throw routesError;
  
  return routesData || [];
};

/**
 * Fetches stops for the specified route IDs
 */
export const fetchStopsForRoutes = async (routeIds: string[]) => {
  if (!routeIds.length) return [];
  
  const { data: stopsData, error: stopsError } = await supabase
    .from('stops')
    .select('*')
    .in('route_id', routeIds)
    .order('sequence_number', { ascending: true });
  
  if (stopsError) throw stopsError;
  
  return stopsData || [];
};

/**
 * Maps raw route and stop data to the RouteData format
 */
export const mapRoutesToDataFormat = (routesData: any[], stopsData: any[]): RouteData[] => {
  return routesData.map(route => {
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
        startTime: '07:30',
        endTime: '07:50'
      }
    };
  });
};
