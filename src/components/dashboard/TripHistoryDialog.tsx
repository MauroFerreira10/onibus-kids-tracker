
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History, Bus, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TripHistoryDialogProps {
  busId?: string;
}

// Mock data para o histórico de viagens
const mockTripHistory = [
  {
    id: '1',
    date: '2025-04-28',
    startTime: '07:15',
    endTime: '08:45',
    status: 'completed',
    route: 'Escola Municipal → Centro',
    stops: 12,
    delay: 0
  },
  {
    id: '2',
    date: '2025-04-27',
    startTime: '07:10',
    endTime: '08:55',
    status: 'delayed',
    route: 'Escola Municipal → Centro',
    stops: 12,
    delay: 15
  },
  {
    id: '3',
    date: '2025-04-26',
    startTime: '07:15',
    endTime: '08:40',
    status: 'completed',
    route: 'Escola Municipal → Centro',
    stops: 12,
    delay: 0
  },
  {
    id: '4',
    date: '2025-04-25',
    startTime: '07:20',
    endTime: '08:50',
    status: 'completed',
    route: 'Escola Municipal → Centro',
    stops: 12,
    delay: 5
  },
];

const TripHistoryDialog: React.FC<TripHistoryDialogProps> = ({ busId }) => {
  const [open, setOpen] = useState(false);
  
  const filteredHistory = busId 
    ? mockTripHistory 
    : mockTripHistory.slice(0, 3); // Se não houver ônibus selecionado, mostra apenas os 3 últimos

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <History className="mr-2 h-5 w-5" />
            Histórico de Viagens
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredHistory.map(trip => (
            <div 
              key={trip.id} 
              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{trip.date}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1" /> 
                    {trip.startTime} - {trip.endTime}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`
                    ${trip.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                    ${trip.status === 'delayed' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                  `}
                >
                  {trip.status === 'completed' ? 'Concluída' : 'Atrasada'}
                </Badge>
              </div>
              
              <div className="flex items-center mt-3">
                <MapPin className="h-4 w-4 text-gray-500 mr-1.5" />
                <span className="text-sm">{trip.route}</span>
              </div>
              
              <div className="flex justify-between mt-3 pt-2 border-t border-dashed border-gray-200">
                <div className="text-sm text-gray-500">
                  <Bus className="h-3.5 w-3.5 inline mr-1" />
                  {trip.stops} paradas
                </div>
                {trip.delay > 0 && (
                  <div className="text-sm text-amber-600 font-medium">
                    Atraso de {trip.delay} min
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum histórico de viagem disponível</p>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-center">
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
