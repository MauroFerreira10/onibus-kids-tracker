import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { stopService } from '@/services/stopService';
import { toast } from 'sonner';
import { BusArrivalNotification } from '@/components/notifications/BusArrivalNotification';

interface RouteInfoProps {
  routeId: string | null;
  vehicleId: string;
  currentStopId?: string;
}

const RouteInfo: React.FC<RouteInfoProps> = ({ routeId, vehicleId, currentStopId }) => {
  const [routeInfo, setRouteInfo] = useState<{
    name: string;
    description: string;
    stops: { id: string; name: string; address: string }[];
    nextStop?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isArrived, setIsArrived] = useState(false);
  
  useEffect(() => {
    const fetchRouteInfo = async () => {
      if (!routeId) return;
      
      try {
        setLoading(true);
        
        // Fetch route data
        const { data: routeData, error: routeError } = await supabase
          .from('routes')
          .select('name, description')
          .eq('id', routeId)
          .single();
        
        if (routeError) throw routeError;
        
        // Fetch stops
        const { data: stopsData, error: stopsError } = await supabase
          .from('stops')
          .select('id, name, address, sequence_number')
          .eq('route_id', routeId)
          .order('sequence_number', { ascending: true });
        
        if (stopsError) throw stopsError;
        
        setRouteInfo({
          name: routeData.name,
          description: routeData.description || '',
          stops: stopsData || [],
          nextStop: stopsData && stopsData.length > 0 ? stopsData[0].address : undefined
        });
      } catch (error) {
        console.error('Erro ao buscar informações da rota:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRouteInfo();
  }, [routeId]);
  
  const handleArrival = async () => {
    if (!currentStopId) return;
    
    try {
      setLoading(true);
      await stopService.registerArrival(currentStopId, vehicleId);
      setIsArrived(true);
      toast.success('Chegada registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar chegada:', error);
      toast.error('Erro ao registrar chegada');
    } finally {
      setLoading(false);
    }
  };

  const handleDeparture = async () => {
    if (!currentStopId) return;
    
    try {
      setLoading(true);
      await stopService.registerDeparture(currentStopId, vehicleId);
      setIsArrived(false);
      toast.success('Saída registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      toast.error('Erro ao registrar saída');
    } finally {
      setLoading(false);
    }
  };

  if (!routeId) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Bus className="mr-2 h-5 w-5 text-busapp-primary" />
            Informações da Rota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <p>Nenhuma rota atribuída ao seu veículo</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Bus className="mr-2 h-5 w-5 text-busapp-primary" />
            Informações da Rota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Bus className="mr-2 h-5 w-5 text-busapp-primary" />
          Informações da Rota
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Rota:</span>
            <span>{routeInfo?.name || 'Não definida'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Pontos de parada:</span>
            <span>{routeInfo?.stops.length || 0} paradas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Próximo ponto:</span>
            <span className="text-busapp-primary flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {currentStopId ? 'Parada atual' : 'Não definido'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Previsão:</span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              3 minutos
            </span>
          </div>

          {currentStopId && (
            <div className="flex justify-center space-x-4">
              {!isArrived ? (
                <Button
                  onClick={handleArrival}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Registrar Chegada
                </Button>
              ) : (
                <Button
                  onClick={handleDeparture}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Registrar Saída
                </Button>
              )}
            </div>
          )}

          <div className="mt-4">
            <BusArrivalNotification vehicleId={vehicleId} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteInfo;
