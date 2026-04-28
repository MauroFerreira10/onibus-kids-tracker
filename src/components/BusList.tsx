
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
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 px-2 sm:px-4 text-gray-900 flex items-center gap-2">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-safebus-blue"
          aria-hidden="true"
        >
          <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
          <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
        </svg>
        Autocarros Ativos
      </h2>
      {buses.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
              aria-hidden="true"
            >
              <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
              <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-gray-500 text-base font-medium">Nenhum autocarro ativo no momento</p>
          <p className="text-gray-400 text-sm mt-1">Os autocarros aparecerão aqui quando estiverem em rota</p>
        </div>
      ) : (
        <ul className="space-y-3 px-2 sm:px-4" role="listbox" aria-label="Lista de autocarros disponíveis">
          {buses.map((bus) => (
            <li 
              key={bus.id}
              onClick={() => onSelectBus(bus.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectBus(bus.id);
                }
              }}
              tabIndex={0}
              role="option"
              aria-selected={selectedBusId === bus.id}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                selectedBusId === bus.id 
                  ? 'bg-safebus-blue border-safebus-blue text-white shadow-lg scale-[1.02]' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div className={`flex-shrink-0 p-2.5 rounded-xl transition-colors ${
                    selectedBusId === bus.id ? 'bg-white/20' : 'bg-blue-50'
                  }`}>
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={selectedBusId === bus.id ? 'text-white' : 'text-safebus-blue'}
                      aria-hidden="true"
                    >
                      <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                      <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-base sm:text-lg truncate ${
                      selectedBusId === bus.id ? 'text-white' : 'text-gray-900'
                    }`}>{bus.route} - {bus.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={14} className={
                        selectedBusId === bus.id ? 'text-white/80' : 'text-gray-500'
                      } aria-hidden="true" />
                      <span className={
                        `text-sm truncate ${
                          selectedBusId === bus.id ? 'text-white/80' : 'text-gray-600'
                        }`
                      }>
                        {bus.currentStop}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                    selectedBusId === bus.id 
                      ? 'bg-white/20 text-white' 
                      : bus.onTime 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-amber-50 text-amber-700'
                  }`}>
                    <Clock size={14} aria-hidden="true" />
                    {bus.onTime ? 'No horário' : 'Atrasado'}
                  </div>
                  <div className={`text-xs mt-1.5 ${
                    selectedBusId === bus.id ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatDistanceToNow(new Date(bus.lastUpdate), { 
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
