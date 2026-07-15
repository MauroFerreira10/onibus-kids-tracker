import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import Layout from '@/components/Layout';
const MapView = lazy(() => import('@/components/MapView'));
import BusList from '@/components/BusList';
import { useBusData } from '@/hooks/useBusData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, AlertTriangle, Clock, RefreshCw, Loader2, Navigation, MapPin, Bell, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import NextStopCard from '@/components/dashboard/NextStopCard';
import StatusCard from '@/components/dashboard/StatusCard';
import TripHistoryDialog from '@/components/dashboard/TripHistoryDialog';
import RecentNotificationsDialog from '@/components/notifications/RecentNotificationsDialog';
import DashboardBackground from '@/components/dashboard/DashboardBackground';

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const Index = () => {
  const { user, profile } = useAuth();
  const [parentVehicleIds, setParentVehicleIds] = useState<string[] | undefined>();
  const [buses, setBuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('map');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showParentBanner, setShowParentBanner] = useState(true);
  const [statsExpanded, setStatsExpanded] = useState(false);

  const isParentUser = profile?.role === 'parent';

  const { buses: allBuses, isLoading: busLoading, error: busError, refreshBuses } = useBusData(
    isParentUser && parentVehicleIds ? { vehicleIds: parentVehicleIds } : undefined
  );

  useEffect(() => {
    if (!busLoading) {
      setBuses(allBuses);
      setIsLoading(busLoading);
    }
  }, [allBuses, busLoading]);

  useEffect(() => {
    if (busError) setError(busError);
  }, [busError]);

  useEffect(() => {
    if (!isParentUser || !user) return;
    const fetchParentVehicles = async () => {
      try {
        const { data: children } = await supabase
          .from('children')
          .select('student_number')
          .eq('parent_id', user.id);

        if (!children?.length) return;

        const studentNumbers = children.map(c => c.student_number).filter(Boolean);
        const { data: students } = await supabase
          .from('students')
          .select('route_id')
          .in('student_number', studentNumbers);

        const routeIds = [...new Set(students?.map(s => s.route_id).filter(Boolean))] as string[];
        if (!routeIds.length) return;

        const { data: routes } = await supabase
          .from('routes')
          .select('vehicle_id')
          .in('id', routeIds);

        const ids = [...new Set(routes?.map(r => r.vehicle_id).filter(Boolean))] as string[];
        if (ids.length) setParentVehicleIds(ids);
      } catch (err) {
        console.error('Erro ao buscar veículos dos filhos:', err);
      }
    };
    fetchParentVehicles();
  }, [isParentUser, user]);

  const isLoading_ = isLoading || (isParentUser && parentVehicleIds === undefined);

  const selectedBus = selectedBusId ? buses.find(bus => bus.id === selectedBusId) : null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBuses();
      setLastUpdate(new Date());
      toast.success('Dados atualizados com sucesso');
    } catch (err) {
      toast.error('Erro ao atualizar os dados');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdate = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(prev => prev === busId ? undefined : busId);
    if (activeTab === 'list') {
      setActiveTab('map');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshBuses();
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshBuses]);

  return (
    <Layout>
      <DashboardBackground />
      <div className="relative z-10 flex flex-col gap-3 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-24">
        {/* Minimalist Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-safebus-blue to-safebus-blue-dark flex items-center justify-center shadow-md">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-safebus-blue leading-tight">SafeBus</h1>
              <p className="text-[10px] text-gray-400 leading-tight">Rastreamento em Tempo Real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold text-emerald-700">Online</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </motion.header>

        {/* Parent Banner */}
        <AnimatePresence>
          {isParentUser && showParentBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-100 rounded-lg">
                  <Bus className="h-4 w-4 text-violet-600" />
                </div>
                <p className="text-sm text-violet-800 font-medium">
                  A mostrar apenas autocarros dos teus filhos
                </p>
              </div>
              <button onClick={() => setShowParentBanner(false)} className="text-violet-400 hover:text-violet-600">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map - Hero area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100"
          style={{ height: isParentUser ? '440px' : '500px' }}
        >
          {isLoading_ ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-safebus-blue" />
                <p className="text-safebus-blue font-semibold text-sm">Carregando...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center bg-red-50">
              <div className="text-center p-6">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <Button size="sm" onClick={refreshBuses} variant="destructive">
                  <RefreshCw className="h-3 w-3 mr-1" /> Tentar novamente
                </Button>
              </div>
            </div>
          ) : (
            <Suspense fallback={
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-safebus-blue" />
              </div>
            }>
              <MapView
                buses={buses}
                selectedBusId={selectedBusId}
                onSelectBus={handleSelectBus}
              />
            </Suspense>
          )}

          {/* Selected Bus Info - floating on map */}
          <AnimatePresence>
            {selectedBus && !isLoading_ && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="p-1.5 bg-safebus-blue/10 rounded-lg flex-shrink-0">
                      <MapPin className="h-4 w-4 text-safebus-blue" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedBus.currentStop}</p>
                      <p className="text-xs text-gray-500">Próxima: {selectedBus.nextStop}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          {selectedBus.estimatedTimeToNextStop} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedBusId(undefined)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats bar - floating bottom of map */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 px-4 py-2.5">
              <button
                onClick={() => setStatsExpanded(v => !v)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Bus className="h-4 w-4 text-safebus-blue" />
                    <span className="text-sm font-bold text-safebus-blue">{buses.length}</span>
                    <span className="text-xs text-gray-500">autocarros</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">{formatLastUpdate(lastUpdate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
                    disabled={isRefreshing}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-safebus-blue transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  {statsExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {statsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-gray-100 mt-2.5">
                      <div className="bg-safebus-blue/5 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-gray-500">Autocarros</p>
                        <p className="text-lg font-bold text-safebus-blue">{buses.length}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-gray-500">Próx. Paragem</p>
                        <p className="text-lg font-bold text-amber-700">{selectedBus?.estimatedTimeToNextStop || '-'}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-gray-500">Estado</p>
                        <p className="text-lg font-bold text-emerald-700">Online</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-gray-500">Ações</p>
                        <div className="flex justify-center gap-1 mt-0.5">
                          <TripHistoryDialog busId={selectedBusId} />
                        </div>
                      </div>
                    </div>
                    {selectedBus && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <NextStopCard bus={selectedBus} />
                        <StatusCard bus={selectedBus} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Tabs: Map / List */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <TabsList className="bg-gray-100 p-0.5 rounded-lg h-9">
                  <TabsTrigger value="map" className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                    Mapa
                  </TabsTrigger>
                  <TabsTrigger value="list" className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                    Lista
                  </TabsTrigger>
                </TabsList>
                <span className="text-xs text-gray-400">{buses.length} autocarros</span>
              </div>

              <TabsContent value="map" className="px-4 pb-4 mt-0">
                {isLoading_ ? (
                  <div className="space-y-3">
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
                ) : (
                  <BusList
                    buses={buses}
                    selectedBusId={selectedBusId}
                    onSelectBus={handleSelectBus}
                  />
                )}
              </TabsContent>

              <TabsContent value="list" className="px-4 pb-4 mt-0">
                {isLoading_ ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-red-600 mb-3">{error}</p>
                    <Button size="sm" onClick={refreshBuses} variant="destructive">
                      <RefreshCw className="h-3 w-3 mr-1" /> Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <BusList
                    buses={buses}
                    selectedBusId={selectedBusId}
                    onSelectBus={handleSelectBus}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>

      <RecentNotificationsDialog
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
    </Layout>
  );
};

export default Index;