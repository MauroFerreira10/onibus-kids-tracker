
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocationData, VehicleData } from '@/types';
import { MapPin, Navigation, Power } from 'lucide-react';

interface LocationTrackerProps {
  vehicle: VehicleData;
  onStatusChange?: (isTracking: boolean) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ vehicle, onStatusChange }) => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Iniciar o rastreamento de localização
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
      // Solicitar permissão e iniciar o rastreamento contínuo
      const id = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handleLocationError,
        {
          enableHighAccuracy: true, // Alta precisão
          maximumAge: 10000, // Usar cache de até 10 segundos
          timeout: 5000 // Timeout após 5 segundos
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

  // Parar o rastreamento
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
      if (onStatusChange) onStatusChange(false);
      toast.info('Rastreamento de localização parado');
    }
  };

  // Manipular atualizações de posição
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

      // Enviar para o Supabase
      const { error } = await supabase
        .from('locations')
        .insert(locationData);

      if (error) {
        console.error('Erro ao salvar localização:', error);
      }
      
      // Atualizar a última posição do veículo também
      await supabase
        .from('vehicles')
        .update({
          lastLatitude: position.coords.latitude,
          lastLongitude: position.coords.longitude,
          lastLocationUpdate: new Date().toISOString()
        })
        .eq('id', vehicle.id);
        
    } catch (error) {
      console.error('Erro ao processar localização:', error);
    }
  };

  // Lidar com erros de localização
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

  // Limpar o rastreamento ao desmontar o componente
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Formatar as coordenadas para display
  const formatCoordinates = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return value.toFixed(6);
  };

  // Formatar velocidade para display
  const formatSpeed = (speed: number | undefined) => {
    if (speed === undefined || speed === 0) return 'Parado';
    return `${(speed * 3.6).toFixed(1)} km/h`; // Convertendo de m/s para km/h
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-busapp-primary" />
          Rastreamento de Localização
        </h3>
        
        <div>
          {isTracking ? (
            <Badge variant="default" className="bg-green-600">Ativo</Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500">Inativo</Badge>
          )}
        </div>
      </div>

      {permissionDenied ? (
        <div className="bg-red-50 p-3 rounded-md mb-4">
          <p className="text-red-600 text-sm">
            Acesso à localização foi negado. Por favor, permita o acesso nas configurações do seu navegador.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {currentLocation && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500">Latitude</p>
              <p className="font-medium">{formatCoordinates(currentLocation.latitude)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500">Longitude</p>
              <p className="font-medium">{formatCoordinates(currentLocation.longitude)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500">Velocidade</p>
              <p className="font-medium">{formatSpeed(currentLocation.speed)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500">Última Atualização</p>
              <p className="font-medium">{new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        )}

        {isTracking ? (
          <Button 
            onClick={stopTracking} 
            variant="destructive"
            className="w-full"
          >
            <Power className="mr-2 h-4 w-4" />
            Parar Rastreamento
          </Button>
        ) : (
          <Button 
            onClick={startTracking} 
            className="w-full"
            disabled={!vehicle.trackingEnabled}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Iniciar Rastreamento
          </Button>
        )}
        
        {!vehicle.trackingEnabled && (
          <p className="text-sm text-amber-600 text-center mt-2">
            O rastreamento está desativado para este veículo. Ative-o nas configurações do veículo.
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationTracker;
