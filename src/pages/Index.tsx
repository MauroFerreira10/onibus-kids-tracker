import React, { useState, useEffect, lazy, Suspense } from 'react';
import Layout from '@/components/Layout';
const MapView = lazy(() => import('@/components/MapView'));
import BusList from '@/components/BusList';
import { useBusData } from '@/hooks/useBusData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, AlertTriangle, Clock, RefreshCw, Loader2, Navigation, MapPin, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import NextStopCard from '@/components/dashboard/NextStopCard';
import StatusCard from '@/components/dashboard/StatusCard';
import TripHistoryDialog from '@/components/dashboard/TripHistoryDialog';
import { useAuth } from '@/contexts/AuthContext';
import RecentNotificationsDialog from '@/components/notifications/RecentNotificationsDialog';

const Index = () => {
  const { buses, isLoading, error, refreshBuses } = useBusData();
  const [selectedBusId, setSelectedBusId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('map');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const selectedBus = selectedBusId ? buses.find(bus => bus.id === selectedBusId) : null;

  // Função para atualizar os dados dos autocarros
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBuses();
      setLastUpdate(new Date());
      toast.success("Dados atualizados com sucesso");
    } catch (err) {
      toast.error("Erro ao atualizar os dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função para formatar a hora da última atualização
  const formatLastUpdate = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(prev => prev === busId ? undefined : busId);
    // Se selecionou um autocarro e estava na lista, muda para o mapa
    if (activeTab === 'list') {
      setActiveTab('map');
    }
  };

  // Atualizações automáticas
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBuses();
      setLastUpdate(new Date());
    }, 60000); // Atualiza a cada minuto
    
    return () => clearInterval(interval);
  }, [refreshBuses]);

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header/Hero Section */}
        <header
          className="relative overflow-hidden bg-gradient-to-br from-safebus-blue via-safebus-blue to-safebus-blue-dark text-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl"
          role="banner"
          aria-label="Cabeçalho principal do SafeBus"
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FBBF24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-safebus-yellow/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-safebus-yellow/5 rounded-full blur-2xl pointer-events-none" />

          {/* Badge Online */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold">Online</span>
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-center gap-4">
            <img src="/safebus-logo.png" alt="SafeBus Logo" className="h-24 w-auto drop-shadow-lg flex-shrink-0 hidden sm:block" />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-1">
                SafeBus
              </h1>
              <p className="text-safebus-yellow font-semibold text-sm sm:text-base">
                Rastreamento de Autocarros em Tempo Real
              </p>
            </div>
          </div>
        </header>

        {/* Selected Bus Info Bar */}
        {selectedBus && (
          <div
            className="bg-white border-l-4 border-safebus-blue p-4 sm:p-5 rounded-xl shadow-md animate-in fade-in slide-in-from-bottom-3 duration-300"
            role="status"
            aria-live="polite"
            aria-label="Informações do autocarro selecionado"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Coluna Esquerda - Localização Atual */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-safebus-blue/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-safebus-blue" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                    {selectedBus.currentStop}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Localização atual do autocarro
                  </p>
                </div>
              </div>

              {/* Coluna Direita - Próxima Paragem */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-amber-50 rounded-lg">
                  <Navigation className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Próxima: {selectedBus.nextStop}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      {selectedBus.estimatedTimeToNextStop} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" role="region" aria-label="Estatísticas do sistema">
          {/* Card 1 - Autocarros Ativos */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-safebus-blue to-safebus-blue-dark shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] group border-0">
            <div className="absolute top-0 right-0 w-24 h-24 bg-safebus-yellow/15 rounded-full -mr-8 -mt-8" />
            <CardHeader className="pb-2">
              <CardTitle className="text-white/70 text-xs font-semibold uppercase tracking-widest">Autocarros Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-12 w-20 bg-white/20 rounded-lg animate-pulse" aria-label="Carregando..." />
              ) : (
                <div className="text-4xl sm:text-5xl font-extrabold text-white" aria-live="polite">
                  {buses?.length || 0}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-3">
                <div className="p-1.5 bg-safebus-yellow rounded-lg">
                  <Bus className="h-4 w-4 text-safebus-blue" aria-hidden="true" />
                </div>
                <span className="text-white/70 text-xs font-medium">Em operação agora</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Última Atualização */}
          <Card className="bg-white border border-safebus-blue/10 shadow-md hover:shadow-lg transition-all duration-200 hover:border-safebus-blue/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Última Atualização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-safebus-blue tabular-nums" aria-live="polite">
                {formatLastUpdate(lastUpdate)}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-semibold text-xs h-8 px-3 active:scale-95 transition-all shadow-sm border-0"
                  aria-label={isRefreshing ? "Atualizando..." : "Atualizar dados"}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                  {isRefreshing ? "Atualizando..." : "Atualizar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 - Estado do Sistema */}
          <Card className="bg-white border border-safebus-blue/10 shadow-md hover:shadow-lg transition-all duration-200 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Estado do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-emerald-500 text-white border-0 gap-1.5 px-3 py-1 text-sm font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Operacional
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Todos os sistemas funcionando normalmente.</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de próxima parada e status da viagem */}
        {selectedBus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <NextStopCard bus={selectedBus} />
            <StatusCard bus={selectedBus} />
          </div>
        )}

        {/* Action Buttons Bar - Melhorado */}
        <div className="flex flex-col sm:flex-row gap-3" role="toolbar" aria-label="Ações principais">
          <TripHistoryDialog busId={selectedBusId} />
          
          <Button
            variant="outline"
            className="flex-1 sm:flex-initial border-2 border-safebus-blue/20 text-safebus-blue hover:bg-safebus-blue/5 hover:border-safebus-blue/40 font-semibold transition-all active:scale-95"
            onClick={() => setShowNotifications(true)}
            aria-label="Ver notificações recentes"
          >
            <Bell className="mr-2 h-5 w-5" aria-hidden="true" />
            Notificações Recentes
          </Button>
        </div>

        {/* Mapa e Lista de Autocarros */}
        <div className="bg-white border border-safebus-blue/10 rounded-2xl shadow-lg p-4 sm:p-6">
          <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tabs Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <TabsList className="grid grid-cols-2 w-full sm:w-auto bg-safebus-blue/5 p-1 rounded-xl">
                <TabsTrigger
                  value="map"
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-safebus-blue data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all rounded-lg"
                  aria-label="Ver mapa de autocarros"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 20L3.55 17.425C3.15032 17.2344 2.81353 16.9259 2.58035 16.5389C2.34716 16.152 2.22618 15.7045 2.23 15.25V5.75C2.2296 5.28731 2.36223 4.83338 2.60737 4.44126C2.8525 4.04913 3.19813 3.73491 3.6125 3.54C4.02796 3.3428 4.48416 3.26803 4.9357 3.32386C5.38725 3.37969 5.81666 3.56394 6.175 3.85L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 6V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 6L12.825 3.85C13.1833 3.56394 13.6127 3.37969 14.0643 3.32386C14.5158 3.26803 14.972 3.3428 15.3875 3.54C15.8019 3.73491 16.1475 4.04913 16.3926 4.44126C16.6378 4.83338 16.7704 5.28731 16.77 5.75V15.25C16.7738 15.7045 16.6528 16.152 16.4197 16.5389C16.1865 16.9259 15.8497 17.2344 15.45 17.425L10 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Mapa
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-safebus-blue data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all rounded-lg"
                  aria-label="Ver lista de autocarros"
                >
                  <Bus className="h-4 w-4" aria-hidden="true" />
                  Lista
                </TabsTrigger>
              </TabsList>
              
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-safebus-blue/10 text-safebus-blue font-semibold">
                  {buses?.length || 0}
                </span>
                <span>
                  {buses?.length === 1 ? 'autocarro monitorado' : 'autocarros monitorados'}
                </span>
              </div>
            </div>

            <TabsContent value="map">
              <div className="rounded-xl overflow-hidden">
                {isLoading ? (
                  <div className="w-full h-[calc(100vh-14rem)] min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-safebus-blue" />
                        <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-safebus-blue/10"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-safebus-blue font-semibold text-lg">Carregando dados dos autocarros...</p>
                        <p className="text-gray-500 text-sm mt-1">A preparar o mapa</p>
                      </div>
                      {/* Skeleton do mapa */}
                      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-safebus-blue/50 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full min-h-[500px]">
                    <div className="text-center p-8 max-w-md bg-red-50 border-2 border-red-200 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar dados</h3>
                      <p className="text-red-700 mb-6 text-sm">{error}</p>
                      <Button 
                        onClick={refreshBuses}
                        variant="destructive"
                        className="gap-2"
                        aria-label="Tentar carregar dados novamente"
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Tentar novamente
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Suspense fallback={
                    <div className="w-full h-[calc(100vh-14rem)] min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <Loader2 className="h-12 w-12 animate-spin text-safebus-blue" />
                          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-safebus-blue/10"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-safebus-blue font-semibold text-lg">Carregando mapa...</p>
                          <p className="text-gray-500 text-sm mt-1">A inicializar o Mapbox</p>
                        </div>
                      </div>
                    </div>
                  }>
                    <MapView 
                      buses={buses} 
                      selectedBusId={selectedBusId}
                      onSelectBus={handleSelectBus}
                    />
                  </Suspense>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              {isLoading ? (
                <div className="space-y-4 p-2 sm:p-4" role="status" aria-label="Carregando lista de autocarros">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 animate-pulse">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div>
                            <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-32 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="h-4 w-3/4 bg-gray-100 rounded mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  ))}
                  <span className="sr-only">Carregando...</span>
                </div>
              ) : error ? (
                <div className="text-center p-8 max-w-md mx-auto bg-red-50 border-2 border-red-200 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar dados</h3>
                  <p className="text-red-700 mb-6 text-sm">{error}</p>
                  <Button 
                    onClick={refreshBuses}
                    variant="destructive"
                    className="gap-2"
                    aria-label="Tentar carregar dados novamente"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Tentar novamente
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
      </div>

      <RecentNotificationsDialog 
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
    </Layout>
  );
};

export default Index;
