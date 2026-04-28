
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Navigation } from 'lucide-react';
import { BusData } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface NextStopCardProps {
  bus: BusData;
}

const NextStopCard: React.FC<NextStopCardProps> = ({ bus }) => {
  const [etaMinutes, setEtaMinutes] = useState<number | null>(bus.estimatedTimeToNextStop ?? null);
  const [nextStopName, setNextStopName] = useState<string>(bus.nextStop || '');
  const [lastUpdate, setLastUpdate] = useState<string>(bus.lastUpdate);

  useEffect(() => {
    if (!bus.id) return;

    // Subscrição em tempo real ao veículo para pegar ETA actualizado
    const channel = supabase
      .channel(`vehicle_eta_${bus.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: `id=eq.${bus.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row.estimated_eta_minutes !== undefined) {
            setEtaMinutes(row.estimated_eta_minutes);
          }
          if (row.next_stop_name) {
            setNextStopName(row.next_stop_name);
          }
          if (row.last_location_update) {
            setLastUpdate(row.last_location_update);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bus.id]);

  // Sincroniza quando as props mudam (ex: mudança de autocarro)
  useEffect(() => {
    setEtaMinutes(bus.estimatedTimeToNextStop ?? null);
    setNextStopName(bus.nextStop || '');
    setLastUpdate(bus.lastUpdate);
  }, [bus.estimatedTimeToNextStop, bus.nextStop, bus.lastUpdate]);

  const etaLabel = () => {
    if (etaMinutes === null) return 'A calcular...';
    if (etaMinutes === 0) return 'Chegando agora';
    if (etaMinutes === 1) return '1 minuto';
    return `${etaMinutes} minutos`;
  };

  const etaColor = () => {
    if (etaMinutes === null) return 'text-gray-500';
    if (etaMinutes === 0) return 'text-green-600';
    if (etaMinutes <= 5) return 'text-orange-600';
    return 'text-gray-900';
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-safebus-blue" aria-hidden="true" />
          </div>
          <span>Próxima Paragem</span>
          {etaMinutes !== null && etaMinutes <= 5 && etaMinutes > 0 && (
            <span className="ml-auto text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full animate-pulse">
              Chegando em breve
            </span>
          )}
          {etaMinutes === 0 && (
            <span className="ml-auto text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">
              No local
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {nextStopName || 'Nenhuma paragem definida'}
          </h3>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1 bg-gray-100 rounded">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <span className="text-sm">
              Previsão de chegada:{' '}
              <span className={`font-semibold ${etaColor()}`}>
                {etaLabel()}
              </span>
            </span>
          </div>

          {etaMinutes !== null && etaMinutes > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-safebus-blue h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(5, 100 - Math.min(etaMinutes, 30) * 3)}%` }}
              />
            </div>
          )}

          <div className="pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Atualizado: {new Date(lastUpdate).toLocaleTimeString('pt-BR')}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              ETA em tempo real
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextStopCard;
