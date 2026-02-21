
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPinOff, Plus, RefreshCw } from 'lucide-react';

interface EmptyRoutesProps {
  onClearFilters?: () => void;
}

export const EmptyRoutes = ({ onClearFilters }: EmptyRoutesProps) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <MapPinOff className="w-8 h-8 text-gray-400" aria-hidden="true" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Nenhuma rota encontrada
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Não encontramos rotas que correspondam aos seus critérios de busca. 
        Tente ajustar os filtros ou criar uma nova rota.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onClearFilters && (
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Limpar filtros
          </Button>
        )}
        <Button 
          variant="default" 
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Criar nova rota
        </Button>
      </div>
    </div>
  );
};
