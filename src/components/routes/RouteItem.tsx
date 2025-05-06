
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RouteData } from '@/types';
import { StopsList } from './StopsList';

interface RouteItemProps {
  route: RouteData;
  attendanceStatus: Record<string, string>;
  markPresentAtStop: (stopId: string) => Promise<void>;
  user: any | null;
}

export const RouteItem = ({ route, attendanceStatus, markPresentAtStop, user }: RouteItemProps) => {
  return (
    <AccordionItem key={route.id} value={route.id}>
      <AccordionTrigger className="hover:bg-gray-50 px-4">
        <div className="flex items-center">
          <div className="p-2 bg-busapp-primary rounded-full mr-3">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
              <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold">{route.name}</h3>
            <p className="text-gray-600 text-sm">{route.description}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-4 pr-2 py-2">
          <RouteSchedule schedule={route.schedule} />
          <StopsList 
            stops={route.stops} 
            attendanceStatus={attendanceStatus} 
            markPresentAtStop={markPresentAtStop}
            user={user}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const RouteSchedule = ({ schedule }: { schedule: RouteData['schedule'] }) => {
  return (
    <div className="mb-4">
      <h4 className="font-semibold mb-1">Horários</h4>
      <p className="text-gray-600 text-sm">
        <Clock size={14} className="inline mr-1" />
        {schedule.startTime} - {schedule.endTime}
      </p>
      <p className="text-gray-600 text-sm mt-1">
        Dias: {schedule.weekdays.map(day => 
          day.charAt(0).toUpperCase() + day.slice(1)
        ).join(', ')}
      </p>
    </div>
  );
};

import { Clock } from 'lucide-react';
