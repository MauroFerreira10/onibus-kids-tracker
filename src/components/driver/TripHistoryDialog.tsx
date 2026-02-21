import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface TripHistory {
  id: string;
  route_id: string;
  vehicle_id: string;
  start_time: string;
  end_time: string;
  completed_stops: number;
  total_stops: number;
  routes: {
    name: string;
  };
  vehicles: {
    license_plate: string;
    model: string;
  };
}

export function TripHistoryDialog() {
  const [loading, setLoading] = useState(false);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTripHistory();
    }
  }, [open]);

  // Limpar viagens expiradas periodicamente
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        await supabase.rpc('cleanup_expired_trips');
        // Recarregar histórico se o diálogo estiver aberto
        if (open) {
          fetchTripHistory();
        }
      } catch (error) {
        console.error('Erro ao limpar viagens expiradas:', error);
      }
    }, 300000); // A cada 5 minutos
    
    return () => clearInterval(cleanupInterval);
  }, [open]);

  const fetchTripHistory = async () => {
    try {
      setLoading(true);
      
      // Limpar viagens expiradas antes de buscar
      await supabase.rpc('cleanup_expired_trips');
      
      const { data, error } = await supabase
        .from('trip_history')
        .select(`
          id,
          route_id,
          vehicle_id,
          start_time,
          end_time,
          completed_stops,
          total_stops,
          status,
          routes!inner (
            name
          ),
          vehicles!inner (
            license_plate,
            model
          )
        `)
        .gt('expires_at', new Date().toISOString()) // Apenas viagens não expiradas
        .order('start_time', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setTripHistory(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico de viagens:', error);
      toast.error('Erro ao carregar histórico de viagens');
    } finally {
      setLoading(false);
    }
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Histórico de Viagens</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Visualize o histórico das últimas viagens realizadas.
        </DialogDescription>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Carregando histórico de viagens...</div>
          ) : tripHistory.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhuma viagem encontrada</p>
          ) : (
            tripHistory.map((trip) => (
              <div key={trip.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {trip.vehicles?.license_plate || 'N/A'}
                  </span>
                </div>
                <div className="text-sm">
                  <p>Rota: {trip.routes?.name || 'N/A'}</p>
                  <p>Início: {new Date(trip.start_time).toLocaleString('pt-BR')}</p>
                  {trip.end_time && (
                    <p>Fim: {new Date(trip.end_time).toLocaleString('pt-BR')}</p>
                  )}
                  <p>Paradas: {trip.completed_stops} de {trip.total_stops}</p>
                  <p className="mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trip.status === 'in_progress' 
                        ? 'bg-blue-100 text-blue-800' 
                        : trip.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {trip.status === 'in_progress' ? 'Em andamento' : 
                       trip.status === 'completed' ? 'Concluída' : 'Finalizada'}
                    </span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 