import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { RouteItem } from './RouteItem';
import { RouteData } from '@/types';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';

interface RoutesListProps {
  routes: RouteData[];
  attendanceStatus: Record<string, string>;
  markPresentAtStop: (stopId: string) => Promise<void>;
  user: any | null;
}

export const RoutesList = ({ routes, attendanceStatus, markPresentAtStop, user }: RoutesListProps) => {
  const [filter, setFilter] = React.useState('all');
  
  const filteredRoutes = React.useMemo(() => {
    switch (filter) {
      case 'active':
        return routes.filter(route => route.status === 'active');
      case 'completed':
        return routes.filter(route => route.status === 'completed');
      default:
        return routes;
    }
  }, [routes, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiFilter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm text-gray-700 font-medium"
          >
            <option value="all">Todas as Rotas</option>
            <option value="active">Em Andamento</option>
            <option value="completed">Concluídas</option>
          </select>
        </div>
        <span className="text-sm text-gray-500">
          {filteredRoutes.length} {filteredRoutes.length === 1 ? 'rota encontrada' : 'rotas encontradas'}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Accordion type="single" collapsible className="w-full space-y-4">
          {filteredRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RouteItem 
                route={route} 
                attendanceStatus={attendanceStatus} 
                markPresentAtStop={markPresentAtStop}
                user={user}
              />
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </div>
  );
};
