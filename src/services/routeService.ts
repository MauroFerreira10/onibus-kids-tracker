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

  return routes.map(route => {
    // Normalizar schedule independentemente do formato vindo da BD
    const raw = route.schedule;
    let schedule: RouteData['schedule'] | null = null;
    if (raw) {
      if (Array.isArray(raw.weekdays)) {
        // Formato já correto
        schedule = raw;
      } else {
        // Formato da BD: { days: "Segunda a Sexta", departures: ["06:30", ...] }
        const departures: string[] = Array.isArray(raw.departures) ? raw.departures : [];
        schedule = {
          weekdays: raw.days ? [raw.days] : ['Segunda a Sexta'],
          startTime: departures[0] ?? '06:30',
          endTime: departures[departures.length - 1] ?? '07:00',
        };
      }
    }

    return {
      id: route.id,
      name: route.name,
      description: route.description,
      status: route.status,
      schedule,
      stops: stopsByRouteId[route.id] || [],
      passengers: route.passengers || 0,
      total_stops: route.total_stops || 0,
      buses: route.buses || [],
    };
  });
};
