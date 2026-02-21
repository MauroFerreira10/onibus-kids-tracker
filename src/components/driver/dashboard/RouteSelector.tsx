
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus } from 'lucide-react';

interface RouteSelectorProps {
  routeId: string | null;
  availableRoutes: Array<{id: string, name: string}>;
  loadingRoutes: boolean;
  onSelectRoute: (routeId: string) => Promise<void>;
  disabled?: boolean;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  routeId,
  availableRoutes,
  loadingRoutes,
  onSelectRoute,
  disabled = false
}) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Bus className="mr-2 h-5 w-5 text-busapp-primary" />
          Selecionar Rota
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingRoutes ? (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-busapp-primary"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-2">
              Selecione a rota que você irá dirigir hoje:
            </p>
            
            <Select
              value={routeId || undefined}
              onValueChange={(value) => onSelectRoute(value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma rota" />
              </SelectTrigger>
              <SelectContent>
                {availableRoutes.length > 0 ? (
                  availableRoutes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-routes" disabled>
                    Nenhuma rota disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {routeId && (
              <p className="text-sm text-green-600 mt-2">
                Rota selecionada com sucesso!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteSelector;
