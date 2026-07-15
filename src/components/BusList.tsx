import React from 'react';
import { BusData } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MapPin, Bus } from 'lucide-react';

interface BusListProps {
  buses: BusData[];
  selectedBusId?: string;
  onSelectBus: (busId: string) => void;
}

const BusList: React.FC<BusListProps> = ({ buses, selectedBusId, onSelectBus }) => {
  if (buses.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Bus className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-base font-medium">Nenhum autocarro ativo no momento</p>
        <p className="text-gray-400 text-sm mt-1">Os autocarros aparecerão aqui quando estiverem em rota</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" role="listbox" aria-label="Lista de autocarros disponíveis">
      {buses.map(bus => {
        const isSelected = selectedBusId === bus.id;
        return (
          <li
            key={bus.id}
            onClick={() => onSelectBus(bus.id)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectBus(bus.id); } }}
            tabIndex={0}
            role="option"
            aria-selected={isSelected}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
              isSelected
                ? 'bg-safebus-blue border-safebus-blue text-white shadow-lg scale-[1.02]'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <div className={`flex-shrink-0 p-2.5 rounded-xl transition-colors ${isSelected ? 'bg-white/20' : 'bg-blue-50'}`}>
                  <Bus className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-safebus-blue'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-base sm:text-lg truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {bus.route} - {bus.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={14} className={isSelected ? 'text-white/80' : 'text-gray-500'} />
                    <span className={`text-sm truncate ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>{bus.currentStop}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                  isSelected ? 'bg-white/20 text-white' : bus.onTime ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  <Clock size={14} />
                  {bus.onTime ? 'No horário' : 'Atrasado'}
                </div>
                <div className={`text-xs mt-1.5 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                  {formatDistanceToNow(new Date(bus.lastUpdate), { addSuffix: true, locale: ptBR })}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default React.memo(BusList, (prev, next) => {
  return prev.selectedBusId === next.selectedBusId && prev.buses === next.buses && prev.onSelectBus === next.onSelectBus;
});