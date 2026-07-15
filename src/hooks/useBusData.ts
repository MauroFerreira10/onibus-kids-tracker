import { useState, useEffect, useCallback, useRef } from 'react';
import { BusData, BusFilters } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export function useBusData(filters?: BusFilters & { schoolId?: string; vehicleIds?: string[] }) {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('tracking_enabled', true)
        .not('last_latitude', 'is', null)
        .not('last_longitude', 'is', null);

      if (filters?.schoolId) {
        query = query.eq('school_id', filters.schoolId);
      }

      if (filters?.vehicleIds && filters.vehicleIds.length > 0) {
        query = query.in('id', filters.vehicleIds);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

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
          onTime: true,
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
  }, [filters?.schoolId, filters?.vehicleIds?.join(',')]);

  useEffect(() => {
    fetchVehicles();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('vehicle_updates')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: 'tracking_enabled=eq.true',
        },
        fetchVehicles)
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchVehicles]);

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
    refreshBuses: fetchVehicles,
  };
}