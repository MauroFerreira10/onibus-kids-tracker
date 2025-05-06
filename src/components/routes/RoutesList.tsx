
import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { RouteItem } from './RouteItem';
import { RouteData } from '@/types';

interface RoutesListProps {
  routes: RouteData[];
  attendanceStatus: Record<string, string>;
  markPresentAtStop: (stopId: string) => Promise<void>;
  user: any | null;
}

export const RoutesList = ({ routes, attendanceStatus, markPresentAtStop, user }: RoutesListProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {routes.map((route) => (
        <RouteItem 
          key={route.id} 
          route={route} 
          attendanceStatus={attendanceStatus} 
          markPresentAtStop={markPresentAtStop}
          user={user}
        />
      ))}
    </Accordion>
  );
};
