import React, { useMemo, useCallback, useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { RouteItem } from './RouteItem';
import { RouteData } from '@/types';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';

interface RoutesListProps {
  routes: RouteData[];
  attendanceStatus: Record<string, string>;
  markPresentAtStop: (stopId: string) => Promise<void>;
  user: any | null;
}

export const RoutesList = React.memo(({ routes, attendanceStatus, markPresentAtStop, user }: RoutesListProps) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredRoutes = useMemo(() => {
    let result = routes;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(route => 
        route.name.toLowerCase().includes(query) ||
        route.description?.toLowerCase().includes(query) ||
        route.stops?.some(stop => stop.name.toLowerCase().includes(query)) ||
        route.stops?.some(stop => stop.address?.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    switch (filter) {
      case 'active':
        return result.filter(route => route.status === 'active');
      case 'completed':
        return result.filter(route => route.status === 'completed');
      default:
        return result;
    }
  }, [routes, filter, searchQuery]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilter('all');
    setSearchQuery('');
  }, []);

  const routeCount = filteredRoutes.length;
  const routeLabel = routeCount === 1 ? 'rota encontrada' : 'rotas encontradas';

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar - design profissional */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Pesquisar rotas, paradas ou endereços..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            aria-label="Pesquisar rotas"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Limpar pesquisa"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Filter Select */}
        <div className="flex items-center space-x-2">
          <FiFilter className="w-5 h-5 text-gray-500" aria-hidden="true" />
          <label htmlFor="route-filter" className="sr-only">Filtrar rotas</label>
          <select
            id="route-filter"
            value={filter}
            onChange={handleFilterChange}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-medium min-h-[44px] cursor-pointer"
            aria-describedby="route-count"
          >
            <option value="all">Todas as Rotas</option>
            <option value="active">Em Andamento</option>
            <option value="completed">Concluídas</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <span id="route-count" className="text-sm text-gray-600" aria-live="polite">
          {routeCount} {routeLabel}
        </span>
        {(searchQuery || filter !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Routes List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Accordion type="single" collapsible className="w-full space-y-3">
          {filteredRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.2) }}
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
});

RoutesList.displayName = 'RoutesList';
