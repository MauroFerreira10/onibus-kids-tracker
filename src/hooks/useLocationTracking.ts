import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocationData, VehicleData } from '@/types';

interface UseLocationTrackingProps {
  vehicle: VehicleData;
  user: { id: string } | null;
  onStatusChange?: (isTracking: boolean) => void;
}

export const useLocationTracking = ({ vehicle, user, onStatusChange }: UseLocationTrackingProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Start location tracking
  const startTracking = () => {
    if (!user) {
      toast.error('Você precisa estar logado para rastrear a localização');
      return;
    }

    if (!vehicle.trackingEnabled) {
      toast.error('O rastreamento está desativado para este veículo');
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Seu navegador não suporta geolocalização');
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;
    const timeout = 10000; // Aumentado para 10 segundos

    const startWatching = () => {
      try {
        // Request permission and start continuous tracking
        const id = navigator.geolocation.watchPosition(
          handlePositionUpdate,
          (error) => {
            console.error('Erro ao obter localização:', error);
            handleLocationError(error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: timeout
          }
        );

        setWatchId(id);
        setIsTracking(true);
        if (onStatusChange) onStatusChange(true);
        toast.success('Rastreamento de localização iniciado');
      } catch (error) {
        console.error('Erro ao iniciar rastreamento:', error);
        toast.error('Não foi possível iniciar o rastreamento');
      }
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setPermissionDenied(true);
        toast.error('Permissão para acessar localização negada');
        stopTracking();
        return;
      }

      if (retryCount < maxRetries) {
        retryCount++;
        toast.info(`Tentando obter localização novamente (${retryCount}/${maxRetries})...`);
        setTimeout(startWatching, 2000); // Espera 2 segundos antes de tentar novamente
      } else {
        toast.error('Não foi possível obter sua localização após várias tentativas');
        stopTracking();
      }
    };

    startWatching();
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
      if (onStatusChange) onStatusChange(false);
      toast.info('Rastreamento de localização parado');
    }
  };

  // Handle position updates
  const handlePositionUpdate = async (position: GeolocationPosition) => {
    try {
      if (!user) return;

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed || 0,
        direction: position.coords.heading || 0,
        timestamp: new Date().toISOString(),
        vehicleId: vehicle.id,
        driverId: user.id
      };

      setCurrentLocation(locationData);

      // Insert location data directly into the locations table
      const { error } = await supabase
        .from('locations')
        .insert({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 0,
          direction: position.coords.heading || 0,
          vehicle_id: vehicle.id,
          driver_id: user.id
        });

      if (error) {
        console.error('Erro ao salvar localização:', error);
      }
      
      // Update vehicle's last position
      await supabase
        .from('vehicles')
        .update({
          last_latitude: position.coords.latitude,
          last_longitude: position.coords.longitude,
          last_location_update: new Date().toISOString()
        })
        .eq('id', vehicle.id);
        
    } catch (error) {
      console.error('Erro ao processar localização:', error);
    }
  };

  // Clean up tracking when component unmounts
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    isTracking,
    currentLocation,
    permissionDenied,
    startTracking,
    stopTracking
  };
};
