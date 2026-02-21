
import React from 'react';
import { BusData } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MapPin } from 'lucide-react';

interface BusListProps {
  buses: BusData[];
  selectedBusId?: string;
  onSelectBus: (busId: string) => void;
}

const BusList: React.FC<BusListProps> = ({ 
  buses, 
  selectedBusId,
  onSelectBus 
}) => {
  return (
    <div className="w-full overflow-auto">
      <h2 className="text-xl font-bold mb-4 px-4">Ônibus Ativos</h2>
      {buses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum ônibus ativo no momento</p>
        </div>
      ) : (
        <ul className="space-y-2 px-2">
          {buses.map((bus) => (
            <li 
              key={bus.id}
              onClick={() => onSelectBus(bus.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedBusId === bus.id 
                  ? 'bg-busapp-primary text-white shadow-md' 
                  : 'bg-white hover:bg-gray-50 border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    selectedBusId === bus.id ? 'bg-white' : 'bg-busapp-primary'
                  }`}>
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={selectedBusId === bus.id ? 'text-busapp-primary' : 'text-white'}
                    >
                      <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                      <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      selectedBusId === bus.id ? 'text-white' : 'text-gray-800'
                    }`}>{bus.route} - {bus.name}</h3>
                    <div className="flex items-center text-sm">
                      <MapPin size={14} className={
                        selectedBusId === bus.id ? 'text-white/80' : 'text-gray-500'
                      } />
                      <span className={
                        selectedBusId === bus.id ? 'text-white/80 ml-1' : 'text-gray-500 ml-1'
                      }>
                        {bus.currentStop}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium flex items-center ${
                    selectedBusId === bus.id ? 'text-white/90' : 'text-busapp-primary'
                  }`}>
                    <Clock size={14} className="mr-1" />
                    {bus.onTime ? 'No horário' : 'Atrasado'}
                  </div>
                  <div className={`text-xs ${
                    selectedBusId === bus.id ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    Atualizado {formatDistanceToNow(new Date(bus.lastUpdate), { 
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BusList;
