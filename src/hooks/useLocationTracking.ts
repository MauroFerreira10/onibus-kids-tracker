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
    const maxRetries = 2;
    let currentTimeout = 60000; // Aumentar timeout inicial para 60 segundos
    let useHighAccuracy = false; // Começar sem alta precisão para evitar timeouts

    const startWatching = () => {
      try {
        // Primeiro, tentar obter localização inicial
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Se conseguiu obter localização inicial, iniciar watchPosition
            handlePositionUpdate(position);
            
            const id = navigator.geolocation.watchPosition(
              handlePositionUpdate,
              (error) => {
                console.error('Erro ao obter localização (watchPosition):', error);
                handleLocationError(error);
              },
              {
                enableHighAccuracy: useHighAccuracy,
            maximumAge: 300000, // Aceitar localização até 5 minutos antiga
                timeout: currentTimeout
              }
            );

            setWatchId(id);
            setIsTracking(true);
            if (onStatusChange) onStatusChange(true);
            toast.success('Rastreamento de localização iniciado');
          },
          (error) => {
            console.error('Erro ao obter localização inicial:', error);
            handleLocationError(error);
          },
          {
            enableHighAccuracy: useHighAccuracy,
            maximumAge: 300000,
            timeout: currentTimeout
          }
        );
      } catch (error) {
        console.error('Erro ao iniciar rastreamento:', error);
        toast.error('Não foi possível iniciar o rastreamento');
        stopTracking();
      }
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      console.error('Erro de geolocalização:', {
        code: error.code,
        message: error.message,
        PERMISSION_DENIED: error.PERMISSION_DENIED,
        POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
        TIMEOUT: error.TIMEOUT
      });

      if (error.code === error.PERMISSION_DENIED) {
        setPermissionDenied(true);
        toast.error('Permissão para acessar localização negada. Por favor, permita o acesso à localização nas configurações do navegador.');
        stopTracking();
        return;
      }

      if (error.code === error.TIMEOUT) {
        // Se timeout, tentar com configurações menos restritivas
        if (retryCount < maxRetries) {
          retryCount++;
          currentTimeout = 60000; // Aumentar timeout para 60 segundos
          useHighAccuracy = false; // Desabilitar alta precisão
          toast.info(`Tentando obter localização com configurações alternativas (${retryCount}/${maxRetries})...`);
          setTimeout(startWatching, 3000);
        } else {
          toast.error('Timeout ao obter localização. Verifique se o GPS está ativado e tente novamente.');
          stopTracking();
        }
        return;
      }

      if (error.code === error.POSITION_UNAVAILABLE) {
        if (retryCount < maxRetries) {
          retryCount++;
          toast.info(`Localização temporariamente indisponível. Tentando novamente (${retryCount}/${maxRetries})...`);
          setTimeout(startWatching, 5000);
        } else {
          toast.error('Não foi possível obter sua localização. Verifique se o GPS está ativado.');
          stopTracking();
        }
        return;
      }

      // Outros erros
      if (retryCount < maxRetries) {
        retryCount++;
        toast.info(`Tentando obter localização novamente (${retryCount}/${maxRetries})...`);
        setTimeout(startWatching, 3000);
      } else {
        toast.error('Não foi possível obter sua localização após várias tentativas. Verifique as configurações de localização.');
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
