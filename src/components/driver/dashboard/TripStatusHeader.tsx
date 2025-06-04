import React from 'react';
import { Bus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TripStatusHeaderProps {
  tripStatus: 'idle' | 'in_progress' | 'completed';
  vehicle: any;
  showEndDialog: boolean;
  setShowEndDialog: (show: boolean) => void;
  startTrip: () => void;
  endTrip: () => void;
  currentRoute?: {
    id: string;
    name: string;
    total_stops: number;
  };
  tripStartTime?: Date;
}

const TripStatusHeader: React.FC<TripStatusHeaderProps> = ({
  tripStatus,
  vehicle,
  showEndDialog,
  setShowEndDialog,
  startTrip,
  endTrip,
  currentRoute,
  tripStartTime
}) => {
  const handleEndTrip = async () => {
    try {
      if (!vehicle?.id || !currentRoute || !tripStartTime) {
        throw new Error('Dados da viagem incompletos');
      }

      const endTime = new Date();

      // Salvar histórico da viagem
      const { error: historyError } = await supabase
        .from('trip_history')
        .insert({
          route_id: currentRoute.id,
          vehicle_id: vehicle.id,
          start_time: tripStartTime.toISOString(),
          end_time: endTime.toISOString(),
          completed_stops: 0, // TODO: Implementar contagem de paradas completadas
          total_stops: currentRoute.total_stops
        });

      if (historyError) {
        throw historyError;
      }

      endTrip();
      toast.success('Viagem finalizada com sucesso');
    } catch (error) {
      console.error('Erro ao finalizar viagem:', error);
      toast.error('Erro ao finalizar viagem');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <Bus className="h-6 w-6 text-busapp-primary" />
        <div>
          <h2 className="text-lg font-semibold">Status da Viagem</h2>
          <p className="text-sm text-gray-500">
            {tripStatus === 'idle' && 'Nenhuma viagem em andamento'}
            {tripStatus === 'in_progress' && 'Viagem em andamento'}
            {tripStatus === 'completed' && 'Viagem finalizada'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {tripStatus === 'idle' && (
          <Button
            onClick={startTrip}
            className="bg-busapp-primary hover:bg-busapp-primary/90"
          >
            Iniciar Viagem
          </Button>
        )}

        {tripStatus === 'in_progress' && (
          <Button
            variant="destructive"
            onClick={() => setShowEndDialog(true)}
          >
            Finalizar Viagem
          </Button>
        )}

        {tripStatus === 'completed' && (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluída
          </Badge>
        )}
      </div>

      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Viagem</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja finalizar a viagem atual?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleEndTrip}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripStatusHeader;
