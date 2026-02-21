import React from 'react';
import Layout from '@/components/Layout';
import { useRoutes } from '@/hooks/useRoutes';
import { RoutesList } from '@/components/routes/RoutesList';
import { RoutesLoading } from '@/components/routes/RoutesLoading';
import { EmptyRoutes } from '@/components/routes/EmptyRoutes';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Map, Clock, Users, Navigation } from 'lucide-react';

const Routes = () => {
  const { routes, isLoading, attendanceStatus, markPresentAtStop } = useRoutes();
  const { user } = useAuth();

  const stats = [
    { icon: Map, label: 'Rotas Ativas', value: routes.length },
    { icon: Clock, label: 'Em Andamento', value: routes.filter(r => r.status === 'active').length },
    { icon: Users, label: 'Passageiros Hoje', value: routes.reduce((acc, r) => acc + (r.passengers || 0), 0) },
    { icon: Navigation, label: 'Paradas', value: routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0) },
  ];
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 py-8 space-y-6"
        >
          {/* Header section - design clean e profissional */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Gestão de Rotas</h1>
              <p className="text-gray-600 mt-1">Monitoramento e controle das rotas de transporte escolar</p>
            </div>
            
            {/* Stats grid - layout profissional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <stat.icon className="w-5 h-5 text-gray-700" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                      {isLoading ? (
                        <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mt-1" />
                      ) : (
                        <p className="text-xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        
          {/* Routes list section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
            aria-label="Lista de rotas"
          >
            {isLoading ? (
              <RoutesLoading />
            ) : routes.length > 0 ? (
              <RoutesList 
                routes={routes}
                attendanceStatus={attendanceStatus}
                markPresentAtStop={markPresentAtStop}
                user={user}
              />
            ) : (
              <EmptyRoutes />
            )}
          </motion.section>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Routes;
