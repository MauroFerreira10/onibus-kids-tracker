
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import MapView from '@/components/MapView';
import BusList from '@/components/BusList';
import { useBusData } from '@/hooks/useBusData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, AlertTriangle, Clock, RefreshCw, Loader2, Navigation, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import NextStopCard from '@/components/dashboard/NextStopCard';
import StatusCard from '@/components/dashboard/StatusCard';
import TripHistoryDialog from '@/components/dashboard/TripHistoryDialog';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { buses, isLoading, error, refreshBuses } = useBusData();
  const [selectedBusId, setSelectedBusId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('map');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  
  const selectedBus = selectedBusId ? buses.find(bus => bus.id === selectedBusId) : null;

  // Função para atualizar os dados do ônibus
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
    // Se selecionou um ônibus e estava na lista, muda para o mapa
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
      <div className="flex flex-col gap-6">
        {/* Localização atual do ônibus e horário estimado */}
        {selectedBus && (
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-busapp-primary mr-2" />
              <div>
                <h2 className="font-medium text-lg">{selectedBus.currentStop}</h2>
                <p className="text-sm text-gray-500">Localização atual do ônibus</p>
              </div>
            </div>
            <div className="flex items-center">
              <Navigation className="h-5 w-5 text-busapp-secondary mr-2" />
              <span className="text-sm font-medium">
                {selectedBus.nextStop} 
                <span className="ml-1 text-gray-500">
                  ({selectedBus.estimatedTimeToNextStop} min)
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Cartões de informações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-busapp-primary/80 to-busapp-primary shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <Bus className="mr-2 h-5 w-5" />
                Ônibus Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-20 bg-white/30" />
              ) : (
                <div className="text-4xl font-bold text-white">
                  {buses?.length || 0}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-busapp-secondary/90 to-busapp-secondary shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-busapp-dark text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Última Atualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-busapp-dark">
                  {formatLastUpdate(lastUpdate)}
                </div>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8 w-8 rounded-full bg-white/50"
                >
                  <RefreshCw className={`h-4 w-4 text-busapp-dark ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-busapp-primary/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                  Estado do Sistema
                </span>
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Todos os sistemas operacionais
              </div>
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

        {/* Botões de ação */}
        <div className="flex gap-3 mb-4">
          <TripHistoryDialog busId={selectedBusId} />
          
          <Button 
            variant="outline" 
            className="flex-1 bg-white border-busapp-primary/20 text-busapp-primary hover:bg-busapp-primary/5"
            onClick={() => toast.info("Notificações em breve disponíveis")}
          >
            <Bell className="mr-2 h-5 w-5" />
            Notificações Recentes
          </Button>
        </div>

        {/* Mapa e Lista de Ônibus */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid grid-cols-2 w-64">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 20L3.55 17.425C3.15032 17.2344 2.81353 16.9259 2.58035 16.5389C2.34716 16.152 2.22618 15.7045 2.23 15.25V5.75C2.2296 5.28731 2.36223 4.83338 2.60737 4.44126C2.8525 4.04913 3.19813 3.73491 3.6125 3.54C4.02796 3.3428 4.48416 3.26803 4.9357 3.32386C5.38725 3.37969 5.81666 3.56394 6.175 3.85L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 6V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 6L12.825 3.85C13.1833 3.56394 13.6127 3.37969 14.0643 3.32386C14.5158 3.26803 14.972 3.3428 15.3875 3.54C15.8019 3.73491 16.1475 4.04913 16.3926 4.44126C16.6378 4.83338 16.7704 5.28731 16.77 5.75V15.25C16.7738 15.7045 16.6528 16.152 16.4197 16.5389C16.1865 16.9259 15.8497 17.2344 15.45 17.425L10 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Mapa
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  Lista
                </TabsTrigger>
              </TabsList>
              
              <div className="text-sm text-gray-500 flex items-center">
                {buses?.length} {buses?.length === 1 ? 'ônibus' : 'ônibus'} monitorados
              </div>
            </div>

            <TabsContent value="map" className="h-full">
              <div className="h-full rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="w-full h-[calc(100vh-14rem)] bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-10 w-10 animate-spin text-busapp-primary" />
                      <p className="mt-4 text-busapp-primary font-medium">Carregando dados dos ônibus...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-red-500 text-center p-8 max-w-md bg-red-50 rounded-xl">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                      <p className="text-lg font-semibold mb-2">Erro ao carregar dados</p>
                      <p className="mb-4 text-red-700">{error}</p>
                      <Button 
                        onClick={refreshBuses}
                        variant="destructive"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tentar novamente
                      </Button>
                    </div>
                  </div>
                ) : (
                  <MapView 
                    buses={buses} 
                    selectedBusId={selectedBusId}
                    onSelectBus={handleSelectBus}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-24 mb-2" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-500 text-center p-8 max-w-md mx-auto bg-red-50 rounded-xl">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <p className="text-lg font-semibold mb-2">Erro ao carregar dados</p>
                  <p className="mb-4 text-red-700">{error}</p>
                  <Button 
                    onClick={refreshBuses}
                    variant="destructive"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
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
    </Layout>
  );
};

export default Index;
