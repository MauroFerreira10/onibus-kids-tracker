import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RouteData } from '@/types';
import { StopsList } from './StopsList';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Bus, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RouteItemProps {
  route: RouteData;
  attendanceStatus: Record<string, string>;
  markPresentAtStop: (stopId: string) => Promise<void>;
  user: any | null;
}

export const RouteItem = ({ route, attendanceStatus, markPresentAtStop, user }: RouteItemProps) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <AccordionItem 
      key={route.id} 
      value={route.id}
      className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all"
    >
      <AccordionTrigger className="hover:bg-gray-50 px-6 py-4">
        <div className="flex items-center w-full">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mr-4 shadow-lg">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{route.name}</h3>
              <Badge className={statusColors[route.status]}>
                {route.status === 'active' ? 'Em Andamento' : 
                 route.status === 'completed' ? 'Concluída' : 'Pendente'}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mt-1">{route.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {route.passengers || 0} passageiros
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {route.stops?.length || 0} paradas
              </div>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="px-6 py-4 bg-gray-50"
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
};

const RouteSchedule = ({ schedule }: { schedule: RouteData['schedule'] }) => {
  if (!schedule) {
    return (
      <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          Horários e Dias
        </h4>
        <p className="text-gray-500">Horários não disponíveis</p>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
      <h4 className="font-semibold mb-3 flex items-center">
        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
        Horários e Dias
      </h4>
      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-blue-500" />
          <span className="font-medium">{schedule.startTime} - {schedule.endTime}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {schedule.weekdays.map(day => (
            <Badge key={day} variant="secondary" className="bg-gray-100">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
