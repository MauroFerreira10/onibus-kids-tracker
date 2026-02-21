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
export const mapRoutesToDataFormat = (routes: any[], stops: any[]): RouteData[] => {
  // Create a map of routeId to its stops for quick lookup
  const stopsByRouteId = stops.reduce((acc, stop) => {
    if (!acc[stop.route_id]) {
      acc[stop.route_id] = [];
    }
    acc[stop.route_id].push(stop);
    return acc;
  }, {});

  return routes.map(route => ({
    id: route.id,
    name: route.name,
    description: route.description,
    status: route.status,
    schedule: route.schedule || null, // Ensure schedule is not undefined
    stops: stopsByRouteId[route.id] || [], // Assign stops from the fetched data
    passengers: route.passengers || 0,
    total_stops: route.total_stops || 0,
    buses: route.buses || []
  }));
};
