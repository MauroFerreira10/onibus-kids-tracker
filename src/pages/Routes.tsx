import React from 'react';
import Layout from '@/components/Layout';
import { useRoutes } from '@/hooks/useRoutes';
import { RoutesList } from '@/components/routes/RoutesList';
import { RoutesLoading } from '@/components/routes/RoutesLoading';
import { EmptyRoutes } from '@/components/routes/EmptyRoutes';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Map, Clock, Users, Navigation, TrendingUp, CheckCircle2, Bus } from 'lucide-react';

const Routes = () => {
  const { routes, isLoading, attendanceStatus, markPresentAtStop } = useRoutes();
  const { user } = useAuth();

  const stats = [
    {
      icon: Map,
      label: 'Rotas Ativas',
      value: routes.length,
      accent: 'bg-safebus-blue text-white',
      iconBg: 'bg-white/20',
    },
    {
      icon: Clock,
      label: 'Em Andamento',
      value: routes.filter(r => r.status === 'active').length,
      accent: 'bg-safebus-yellow text-safebus-blue',
      iconBg: 'bg-safebus-blue/20',
    },
    {
      icon: Users,
      label: 'Passageiros Hoje',
      value: routes.reduce((acc, r) => acc + (r.passengers || 0), 0),
      accent: 'bg-safebus-blue-light text-white',
      iconBg: 'bg-white/20',
    },
    {
      icon: Navigation,
      label: 'Paradas',
      value: routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0),
      accent: 'bg-safebus-blue text-white',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
        >
          {/* Hero Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-safebus-blue via-safebus-blue to-safebus-blue-dark rounded-2xl shadow-xl"
          >
            {/* Decorative pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FBBF24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute top-0 right-0 w-64 h-64 bg-safebus-yellow/10 rounded-full -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-safebus-yellow rounded-2xl shadow-lg flex-shrink-0">
                  <Bus className="h-8 w-8 text-safebus-blue" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Gestão de Rotas</h1>
                  <p className="text-safebus-yellow font-semibold text-sm mt-0.5">Monitore o transporte escolar em tempo real</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-white text-sm font-semibold">Sistema Ativo</span>
              </div>
            </div>

            {/* Stats row inside hero */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 border-t border-white/10">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.07 }}
                  className="px-5 py-4 border-r border-white/10 last:border-r-0 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-white/15 rounded-md">
                      <stat.icon className="w-3.5 h-3.5 text-safebus-yellow" />
                    </div>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
                  </div>
                  {isLoading ? (
                    <div className="h-7 w-12 bg-white/20 animate-pulse rounded mt-1" />
                  ) : (
                    <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.header>

          {/* Routes list section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md border border-safebus-blue/10 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-safebus-blue/3 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-safebus-blue">Rotas Disponíveis</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Visualize e confirme presença nas paradas</p>
                </div>
                <div className="flex items-center gap-2 bg-safebus-blue/5 px-3 py-1.5 rounded-full">
                  <TrendingUp className="w-4 h-4 text-safebus-blue" />
                  <span className="text-sm font-semibold text-safebus-blue">
                    {routes.length} {routes.length === 1 ? 'rota' : 'rotas'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
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
            </div>
          </motion.section>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Routes;
