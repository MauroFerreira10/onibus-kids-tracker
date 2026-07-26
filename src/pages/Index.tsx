import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import Layout from '@/components/Layout';
import LoadingScreen from '@/components/LoadingScreen';
const MapView = lazy(() => import('@/components/MapView'));
import BusList from '@/components/BusList';
import { useBusData } from '@/hooks/useBusData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Bus, MapPin, Bell, X, RefreshCw, Clock, Route,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TripHistoryDialog from '@/components/dashboard/TripHistoryDialog';
import RecentNotificationsDialog from '@/components/notifications/RecentNotificationsDialog';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const formatTime = (date: Date) =>
  date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const Index = () => {
  const { user, profile } = useAuth();
  const isParentUser = profile?.role === 'parent';
  const [parentVehicleIds, setParentVehicleIds] = useState<string[] | undefined>();
  const [selectedBusId, setSelectedBusId] = useState<string | undefined>();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showParentBanner, setShowParentBanner] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const loadedOnce = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const { buses, isLoading, error, refreshBuses } = useBusData(
    isParentUser && parentVehicleIds ? { vehicleIds: parentVehicleIds } : undefined
  );

  useEffect(() => {
    if (!isParentUser || !user || parentVehicleIds !== undefined) return;
    const fetch = async () => {
      try {
        const { data: children } = await supabase.from('children').select('student_number').eq('parent_id', user.id);
        if (!children?.length) { setParentVehicleIds([]); return; }
        const { data: students } = await supabase.from('students').select('route_id').in('student_number', children.map(c => c.student_number).filter(Boolean));
        const routeIds = [...new Set(students?.map(s => s.route_id).filter(Boolean))] as string[];
        if (!routeIds.length) { setParentVehicleIds([]); return; }
        const { data: routes } = await supabase.from('routes').select('vehicle_id').in('id', routeIds);
        const ids = [...new Set(routes?.map(r => r.vehicle_id).filter(Boolean))] as string[];
        setParentVehicleIds(ids);
      } catch (err) { console.error(err); setParentVehicleIds([]); }
    };
    fetch();
  }, [isParentUser, user, parentVehicleIds]);

  const refreshRef = useRef(refreshBuses);
  refreshRef.current = refreshBuses;

  useEffect(() => {
    const id = setInterval(() => { refreshRef.current(); setLastUpdate(new Date()); }, 60000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try { await refreshBuses(); setLastUpdate(new Date()); toast.success('Dados atualizados'); }
    catch { toast.error('Erro ao atualizar'); }
    finally { setIsRefreshing(false); }
  }, [refreshBuses]);

  const handleSelectBus = useCallback((busId: string) => {
    setSelectedBusId(prev => prev === busId ? undefined : busId);
  }, []);

  const selectedBus = selectedBusId ? buses.find(b => b.id === selectedBusId) : null;
  const isInitialLoading = isLoading && !loadedOnce.current;
  if (!isInitialLoading) loadedOnce.current = true;

  const activeCount = buses.length;

  return (
    <>
      {(!splashDone || isInitialLoading) && <LoadingScreen />}
    <Layout>
      <DashboardBackground />
      <ErrorBoundary>
      <div className="relative z-10 flex flex-col max-w-7xl mx-auto px-4 pb-28 gap-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-safebus-blue to-safebus-blue-dark flex items-center justify-center shadow-md shadow-safebus-blue/20">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-safebus-blue leading-tight">SafeBus</h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <MapPin className="h-3 w-3" />
                <span>Lubango, Angola</span>
                <span className="text-gray-300 mx-1">·</span>
                <span className={`font-medium ${activeCount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {activeCount > 0 ? `${activeCount} activo${activeCount > 1 ? 's' : ''}` : '0 activos'}
                </span>
              </div>
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
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-gray-200" onClick={() => setShowNotifications(true)}>
              <Bell className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* ── Parent Banner ── */}
        {isParentUser && showParentBanner && (
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-violet-100 rounded-lg">
                <Bus className="h-4 w-4 text-violet-600" />
              </div>
              <p className="text-sm text-violet-800 font-medium">A mostrar apenas autocarros dos teus filhos</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-violet-400 hover:text-violet-600" onClick={() => setShowParentBanner(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── Map ── */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100" style={{ height: isParentUser ? '420px' : '480px' }}>
          {error ? (
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-red-500 text-xl font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <Button size="sm" variant="destructive" onClick={refreshBuses}>
                  <RefreshCw className="h-3 w-3 mr-1.5" /> Tentar novamente
                </Button>
              </div>
            ) : (
            <Suspense fallback={<LoadingScreen />}>
              <MapView buses={buses} selectedBusId={selectedBusId} onSelectBus={handleSelectBus} />
            </Suspense>
          )}

          {/* Selected bus floating bar */}
          {selectedBus && !isInitialLoading && !error && (
            <div className="absolute top-3 left-3 right-3 z-10">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 bg-safebus-blue/10 rounded-lg flex-shrink-0">
                      <Route className="h-4 w-4 text-safebus-blue" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {selectedBus.currentStop || 'Paragem atual'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Próxima: {selectedBus.nextStop || '—'} · {selectedBus.estimatedTimeToNextStop ?? '—'} min
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600 flex-shrink-0" onClick={() => setSelectedBusId(undefined)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom stats bar */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Bus className="h-4 w-4 text-safebus-blue" />
                    <span className="text-sm font-bold text-safebus-blue">{activeCount}</span>
                    <span className="text-xs text-gray-500">autocarro{activeCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">{formatTime(lastUpdate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-safebus-blue" onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  {selectedBus && <TripHistoryDialog busId={selectedBusId} />}
                </div>
              </div>
              {selectedBus && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-gray-100 mt-3">
                  <div className="bg-safebus-blue/5 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Autocarros</p>
                    <p className="text-lg font-bold text-safebus-blue">{activeCount}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Próx. Paragem</p>
                    <p className="text-lg font-bold text-amber-700">{selectedBus.estimatedTimeToNextStop ?? '—'}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Estado</p>
                    <p className="text-lg font-bold text-emerald-700">Online</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-500 mb-1">Histórico</p>
                    <TripHistoryDialog busId={selectedBusId} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bus List ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bus className="h-4 w-4 text-safebus-blue" />
              <span className="text-sm font-semibold text-gray-700">Autocarros</span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{activeCount} autocarro{activeCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-4">
            {isInitialLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-red-400 text-lg font-bold">!</span>
                </div>
                <p className="text-sm text-red-600 mb-3">{error}</p>
                <Button size="sm" variant="destructive" onClick={refreshBuses}>
                  <RefreshCw className="h-3 w-3 mr-1.5" /> Tentar novamente
                </Button>
              </div>
            ) : (
              <BusList buses={buses} selectedBusId={selectedBusId} onSelectBus={handleSelectBus} />
            )}
          </div>
        </div>
        <div className="h-16" />
      </div>

      <RecentNotificationsDialog open={showNotifications} onOpenChange={setShowNotifications} />
      </ErrorBoundary>
    </Layout>
    </>
  );
};

export default Index;
