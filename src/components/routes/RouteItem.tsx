import React, { memo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RouteData } from '@/types';
import { StopsList } from './StopsList';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Bus, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RouteItemProps {
  route: RouteData;
  attendanceStatus: Record<string, string>;
  markPresentAtStop: (stopId: string) => Promise<void>;
  user: any | null;
}

// Design tokens - cores profissionais
const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200'
};

export const RouteItem = memo(({ route, attendanceStatus, markPresentAtStop, user }: RouteItemProps) => {
  const statusLabel = route.status === 'active' ? 'Em Andamento' : 
                      route.status === 'completed' ? 'Concluída' : 'Pendente';

  return (
    <AccordionItem 
      key={route.id} 
      value={route.id}
      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:bg-gray-50/30 transition-colors shadow-sm"
    >
      <AccordionTrigger 
        className="hover:bg-gray-50/50 px-6 py-5 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl"
        aria-label={`Rota ${route.name}, status: ${statusLabel}`}
      >
        <div className="flex items-center w-full">
          <div className="p-3 bg-gray-100 rounded-lg mr-4 border border-gray-200">
            <Bus className="w-6 h-6 text-gray-700" aria-hidden="true" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
              <Badge className={cn(
                "border font-medium",
                statusColors[route.status]
              )}>
                {statusLabel}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mt-1">{route.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" aria-hidden="true" />
                {route.passengers || 0} passageiros
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                {route.stops?.length || 0} paradas
              </div>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="px-6 py-4 bg-gray-50/30 border-t border-gray-200"
        >
          <RouteSchedule schedule={route.schedule} />
          <StopsList 
            stops={route.stops} 
            attendanceStatus={attendanceStatus} 
            markPresentAtStop={markPresentAtStop}
            user={user}
          />
        </motion.div>
      </AccordionContent>
    </AccordionItem>
  );
});

RouteItem.displayName = 'RouteItem';

// Componente de animação do accordion
const accordionContentStyle = {
  animationDuration: '0.2s',
  animationTimingFunction: 'ease-out'
} as const;

const RouteSchedule = ({ schedule }: { schedule: RouteData['schedule'] }) => {
  if (!schedule) {
    return (
      <div className="mb-6 bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold mb-3 flex items-center text-gray-900">
          <Calendar className="w-4 h-4 mr-2 text-gray-600" aria-hidden="true" />
          Horários e Dias
        </h4>
        <p className="text-gray-600">Horários não disponíveis</p>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white rounded-xl p-5 border border-gray-200">
      <h4 className="font-semibold mb-3 flex items-center text-gray-900">
        <Calendar className="w-4 h-4 mr-2 text-gray-600" aria-hidden="true" />
        Horários e Dias
      </h4>
      <div className="space-y-2">
        <div className="flex items-center text-gray-800">
          <Clock className="w-4 h-4 mr-2 text-gray-600" aria-hidden="true" />
          <span className="font-semibold">{schedule.startTime} - {schedule.endTime}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {schedule.weekdays.map(day => (
            <Badge key={day} variant="secondary" className="bg-white border border-gray-200 text-gray-700">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
