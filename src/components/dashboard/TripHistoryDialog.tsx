import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History, Bus, Clock, MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TripHistoryDialogProps {
  busId?: string;
}

interface TripHistory {
  id: string;
  vehicle_id: string;
  start_time: string;
  end_time: string;
  status: 'completed' | 'delayed' | 'cancelled';
  route_name: string;
  total_stops: number;
  delay_minutes: number;
  created_at: string;
}

const TripHistoryDialog: React.FC<TripHistoryDialogProps> = ({ busId }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  
  const fetchTripHistory = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('trip_history')
        .select(`
          id,
          vehicle_id,
          start_time,
          end_time,
          status,
          total_stops,
          delay_minutes,
          created_at,
          routes!inner (
            name
          )
        `)
        .order('start_time', { ascending: false })
        .limit(10);

      if (busId) {
        query = query.eq('vehicle_id', busId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Mapear os dados para o formato esperado pela interface
      const formattedData = data?.map(item => ({
        id: item.id,
        vehicle_id: item.vehicle_id,
        start_time: item.start_time,
        end_time: item.end_time,
        status: item.status as 'completed' | 'delayed' | 'cancelled',
        route_name: item.routes.name,
        total_stops: item.total_stops,
        delay_minutes: item.delay_minutes,
        created_at: item.created_at,
      })) || [];

      setTripHistory(formattedData);
    } catch (error) {
      console.error('Erro ao buscar histórico de viagens:', error);
      toast.error('Erro ao carregar histórico de viagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTripHistory();
    }
  }, [open, busId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-busapp-primary/20 text-busapp-primary hover:bg-busapp-primary/5"
        >
          <History className="mr-2 h-5 w-5" />
          Ver Histórico de Viagens
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <History className="mr-2 h-5 w-5" />
            Histórico de Viagens
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-busapp-primary mb-2" />
              <p className="text-sm text-gray-500">Carregando histórico...</p>
            </div>
          ) : tripHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum histórico de viagem disponível</p>
            </div>
          ) : (
            tripHistory.map(trip => (
              <div 
                key={trip.id} 
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{formatDate(trip.start_time)}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" /> 
                      {formatTime(trip.start_time)} - {formatTime(trip.end_time)}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${trip.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${trip.status === 'delayed' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                      ${trip.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    `}
                  >
                    {trip.status === 'completed' ? 'Concluída' : 
                     trip.status === 'delayed' ? 'Atrasada' : 'Cancelada'}
                  </Badge>
                </div>
                
                <div className="flex items-center mt-3">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1.5" />
                  <span className="text-sm">{trip.route_name}</span>
                </div>
                
                <div className="flex justify-between mt-3 pt-2 border-t border-dashed border-gray-200">
                  <div className="text-sm text-gray-500">
                    <Bus className="h-3.5 w-3.5 inline mr-1" />
                    {trip.total_stops} paradas
                  </div>
                  {trip.delay_minutes > 0 && (
                    <div className="text-sm text-amber-600 font-medium">
                      Atraso de {trip.delay_minutes} min
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setOpen(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripHistoryDialog;
