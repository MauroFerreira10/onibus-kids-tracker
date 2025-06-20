import React from 'react';
import Layout from '@/components/Layout';
import { useRoutes } from '@/hooks/useRoutes';
import { RoutesList } from '@/components/routes/RoutesList';
import { RoutesLoading } from '@/components/routes/RoutesLoading';
import { EmptyRoutes } from '@/components/routes/EmptyRoutes';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiMap, FiClock, FiUsers, FiNavigation } from 'react-icons/fi';

const Routes = () => {
  const { routes, isLoading, attendanceStatus, markPresentAtStop } = useRoutes();
  const { user } = useAuth();

  const stats = [
    { icon: FiMap, label: 'Rotas Ativas', value: routes.length },
    { icon: FiClock, label: 'Em Andamento', value: routes.filter(r => r.status === 'active').length },
    { icon: FiUsers, label: 'Passageiros Hoje', value: routes.reduce((acc, r) => acc + (r.passengers || 0), 0) },
    { icon: FiNavigation, label: 'Paradas', value: routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0) },
  ];
  
  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 p-6"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-6">Rotas Ativas em Lubango</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4"
              >
                <div className="flex items-center space-x-3">
                  <stat.icon className="w-6 h-6" />
                  <div>
                    <p className="text-sm opacity-80">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
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
    </Layout>
  );
};

export default Routes;
