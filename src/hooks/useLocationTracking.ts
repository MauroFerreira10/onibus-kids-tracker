
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

    try {
      // Request permission and start continuous tracking
      const id = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handleLocationError,
        {
          enableHighAccuracy: true, // High accuracy
          maximumAge: 10000, // Use cache up to 10 seconds
          timeout: 5000 // Timeout after 5 seconds
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

      // Use RPC method to insert location
      const { error } = await supabase.rpc('insert_location', {
        driver_id: user.id,
        vehicle_id: vehicle.id,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        spd: position.coords.speed || 0,
        dir: position.coords.heading || 0
      });

      if (error) {
        console.error('Erro ao salvar localização:', error);
      }
      
      // Update vehicle's last position
      await supabase.rpc('update_vehicle_location', {
        veh_id: vehicle.id,
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
        
    } catch (error) {
      console.error('Erro ao processar localização:', error);
    }
  };

  // Handle location errors
  const handleLocationError = (error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      setPermissionDenied(true);
      toast.error('Permissão para acessar localização negada');
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      toast.error('Informações de localização não disponíveis');
    } else if (error.code === error.TIMEOUT) {
      toast.error('Tempo esgotado para obter localização');
    }
    
    stopTracking();
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
