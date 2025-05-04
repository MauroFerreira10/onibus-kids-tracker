
import React from 'react';
import { Bus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

interface TripStatusHeaderProps {
  tripStatus: 'idle' | 'in_progress' | 'completed';
  vehicle: any;
  showEndDialog: boolean;
  setShowEndDialog: (show: boolean) => void;
  startTrip: () => void;
  endTrip: () => void;
}

const TripStatusHeader: React.FC<TripStatusHeaderProps> = ({
  tripStatus,
  vehicle,
  showEndDialog,
  setShowEndDialog,
  startTrip,
  endTrip,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center justify-between">
      <div className="flex items-center">
        <div className={`
          p-2 rounded-full mr-3
          ${tripStatus === 'idle' ? 'bg-gray-100 text-gray-600' : ''}
          ${tripStatus === 'in_progress' ? 'bg-green-100 text-green-700' : ''}
          ${tripStatus === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
        `}>
          <Bus className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-medium text-lg">Painel do Motorista</h2>
          <p className="text-sm text-gray-500">
            Status: {' '}
            <span className={`font-medium 
              ${tripStatus === 'idle' ? 'text-gray-600' : ''}
              ${tripStatus === 'in_progress' ? 'text-green-700' : ''}
              ${tripStatus === 'completed' ? 'text-blue-700' : ''}
            `}>
              {tripStatus === 'idle' ? 'Aguardando início' : 
               tripStatus === 'in_progress' ? 'Viagem em andamento' : 
               'Viagem finalizada'}
            </span>
          </p>
        </div>
      </div>
      
      <div>
        {tripStatus === 'idle' && (
          <Button 
            onClick={startTrip}
            className="bg-green-600 hover:bg-green-700"
            disabled={!vehicle}
          >
            <Bus className="mr-2 h-4 w-4" />
            Iniciar Viagem
          </Button>
        )}
        
        {tripStatus === 'in_progress' && (
          <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <CheckCircle className="mr-2 h-4 w-4" />
                Encerrar Viagem
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar finalização</DialogTitle>
              </DialogHeader>
              <p className="py-4">
                Tem certeza que deseja finalizar esta viagem? Esta ação não pode ser desfeita.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEndDialog(false)}>
                  Cancelar
                </Button>
                <Button variant="default" onClick={endTrip}>
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {tripStatus === 'completed' && (
          <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
            <CheckCircle className="mr-2 h-4 w-4" />
            Viagem Concluída
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TripStatusHeader;
