
import { useState, useEffect } from 'react';
import { BusData, BusFilters } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export function useBusData(filters?: BusFilters) {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch real vehicle data from database
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        
        // Only fetch vehicles with tracking enabled and that have location data
        const { data, error: fetchError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('tracking_enabled', true)
          .not('last_latitude', 'is', null)
          .not('last_longitude', 'is', null);
        
        if (fetchError) {
          throw new Error(fetchError.message);
        }
        
        if (data) {
          // Convert vehicle data to BusData format
          const activeBuses: BusData[] = data.map(vehicle => ({
            id: vehicle.id,
            name: `Veículo ${vehicle.license_plate}`,
            route: vehicle.model,
            latitude: vehicle.last_latitude,
            longitude: vehicle.last_longitude,
            speed: 0, // We don't have real speed data yet
            direction: 0, // We don't have real direction data yet
            status: 'active',
            capacity: vehicle.capacity,
            occupancy: 0, // We don't have real occupancy data yet
            currentStop: 'Em trânsito',
            nextStop: 'Próxima parada',
            estimatedTimeToNextStop: 0, 
            lastUpdate: vehicle.last_location_update || new Date().toISOString(),
            onTime: true
          }));
          
          setBuses(activeBuses);
        } else {
          setBuses([]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados dos veículos:', err);
        setError('Erro ao carregar dados dos veículos');
        setBuses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicles();
    
    // Set up real-time subscription for vehicle updates
    const channel = supabase
      .channel('vehicle_updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'vehicles',
          filter: 'tracking_enabled=eq.true' 
        }, 
        fetchVehicles)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Filtragem de ônibus se houver filtros
  const filteredBuses = filters
    ? buses.filter(bus => {
        if (filters.route && bus.route !== filters.route) return false;
        if (filters.status && bus.status !== filters.status) return false;
        if (filters.onTime !== undefined && bus.onTime !== filters.onTime) return false;
        return true;
      })
    : buses;
  
  return {
    buses: filteredBuses,
    isLoading,
    error,
    refreshBuses: async () => {
      setIsLoading(true);
      
      try {
        const { data } = await supabase
          .from('vehicles')
          .select('*')
          .eq('tracking_enabled', true)
          .not('last_latitude', 'is', null)
          .not('last_longitude', 'is', null);
          
        if (data) {
          const activeBuses: BusData[] = data.map(vehicle => ({
            id: vehicle.id,
            name: `Veículo ${vehicle.license_plate}`,
            route: vehicle.model,
            latitude: vehicle.last_latitude,
            longitude: vehicle.last_longitude,
            speed: 0,
            direction: 0,
            status: 'active',
            capacity: vehicle.capacity,
            occupancy: 0,
            currentStop: 'Em trânsito',
            nextStop: 'Próxima parada',
            estimatedTimeToNextStop: 0,
            lastUpdate: vehicle.last_location_update || new Date().toISOString(),
            onTime: true
          }));
          
          setBuses(activeBuses);
        }
      } catch (err) {
        console.error('Erro ao atualizar dados dos veículos:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };
}
