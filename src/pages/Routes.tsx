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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 py-8 space-y-6"
        >
          {/* Header com glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20"
          >
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rotas Ativas em Lubango
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                      <stat.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        
          {/* Lista de rotas com glassmorphism */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/20"
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
