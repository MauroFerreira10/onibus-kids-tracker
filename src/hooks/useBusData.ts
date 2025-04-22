
import { useState, useEffect } from 'react';
import { BusData, BusFilters } from '@/types';
import { generateMockBuses, updateBusPositions, simulateDelays } from '@/services/mockData';

export function useBusData(filters?: BusFilters) {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Inicializar os dados dos ônibus
  useEffect(() => {
    try {
      // Simulando busca de dados
      setIsLoading(true);
      setTimeout(() => {
        const mockBuses = generateMockBuses();
        setBuses(mockBuses);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Erro ao carregar dados dos ônibus');
      setIsLoading(false);
    }
  }, []);
  
  // Atualizar posições periodicamente
  useEffect(() => {
    if (buses.length === 0) return;
    
    const positionInterval = setInterval(() => {
      setBuses(prev => updateBusPositions(prev));
    }, 5000); // Atualiza a cada 5 segundos
    
    const delayInterval = setInterval(() => {
      setBuses(prev => simulateDelays(prev));
    }, 30000); // Simular atrasos a cada 30 segundos
    
    return () => {
      clearInterval(positionInterval);
      clearInterval(delayInterval);
    };
  }, [buses.length]);
  
  // Filtragem de ônibus se houver filtros
  const filteredBuses = filters
    ? buses.filter(bus => {
        if (filters.route && bus.route !== filters.route) return false;
        if (filters.status && bus.status !== filters.status) return false;
        if (filters.onTime !== undefined && bus.onTime !== filters.onTime) return false;
        return true;
      })
    : buses;
  
  return {
    buses: filteredBuses,
    isLoading,
    error,
    refreshBuses: () => {
      setIsLoading(true);
      setTimeout(() => {
        setBuses(generateMockBuses());
        setIsLoading(false);
      }, 500);
    }
  };
}
