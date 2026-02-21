import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Bus, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuota } from '@/contexts/QuotaContext';

interface QuotaIndicatorProps {
  className?: string;
}

export const QuotaIndicator: React.FC<QuotaIndicatorProps> = ({ className }) => {
  const { currentPlan, usageMetrics, hasExceededQuota } = useQuota();

  if (!currentPlan || !usageMetrics) return null;

  const getUsagePercentage = (current: number, limit: number | 'unlimited'): number => {
    if (limit === 'unlimited') return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const isUnlimited = (limit: number | 'unlimited'): boolean => {
    return limit === 'unlimited';
  };

  const getResourceStatus = (current: number, limit: number | 'unlimited') => {
    if (isUnlimited(limit)) return 'unlimited';
    const percentage = getUsagePercentage(current, limit);
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const studentsStatus = getResourceStatus(usageMetrics.students_count, currentPlan.limits.students);
  const driversStatus = getResourceStatus(usageMetrics.drivers_count, currentPlan.limits.drivers);
  const routesStatus = getResourceStatus(usageMetrics.routes_count, currentPlan.limits.routes);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'normal': return 'text-green-600';
      case 'unlimited': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'normal': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unlimited': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Uso do Plano</span>
          <Badge variant="secondary">{currentPlan.name}</Badge>
        </CardTitle>
        <CardDescription>
          Acompanhe seu consumo atual em relação aos limites do plano
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Students */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Alunos</span>
              {getStatusIcon(studentsStatus)}
            </div>
            <span className={`text-sm font-medium ${getStatusColor(studentsStatus)}`}>
              {usageMetrics.students_count} / {
                isUnlimited(currentPlan.limits.students) 
                  ? '∞' 
                  : currentPlan.limits.students
              }
            </span>
          </div>
          {!isUnlimited(currentPlan.limits.students) && (
            <>
              <Progress 
                value={getUsagePercentage(usageMetrics.students_count, currentPlan.limits.students)} 
                className="h-2"
              />
              {hasExceededQuota('students') && (
                <p className="text-xs text-red-600">
                  Limite de alunos excedido. Faça upgrade do plano.
                </p>
              )}
            </>
          )}
        </div>

        {/* Drivers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bus className="w-4 h-4 text-green-500" />
              <span className="font-medium">Motoristas</span>
              {getStatusIcon(driversStatus)}
            </div>
            <span className={`text-sm font-medium ${getStatusColor(driversStatus)}`}>
              {usageMetrics.drivers_count} / {
                isUnlimited(currentPlan.limits.drivers) 
                  ? '∞' 
                  : currentPlan.limits.drivers
              }
            </span>
          </div>
          {!isUnlimited(currentPlan.limits.drivers) && (
            <>
              <Progress 
                value={getUsagePercentage(usageMetrics.drivers_count, currentPlan.limits.drivers)} 
                className="h-2"
              />
              {hasExceededQuota('drivers') && (
                <p className="text-xs text-red-600">
                  Limite de motoristas excedido. Faça upgrade do plano.
                </p>
              )}
            </>
          )}
        </div>

        {/* Routes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Rotas</span>
              {getStatusIcon(routesStatus)}
            </div>
            <span className={`text-sm font-medium ${getStatusColor(routesStatus)}`}>
              {usageMetrics.routes_count} / {
                isUnlimited(currentPlan.limits.routes) 
                  ? '∞' 
                  : currentPlan.limits.routes
              }
            </span>
          </div>
          {!isUnlimited(currentPlan.limits.routes) && (
            <>
              <Progress 
                value={getUsagePercentage(usageMetrics.routes_count, currentPlan.limits.routes)} 
                className="h-2"
              />
              {hasExceededQuota('routes') && (
                <p className="text-xs text-red-600">
                  Limite de rotas excedido. Faça upgrade do plano.
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};