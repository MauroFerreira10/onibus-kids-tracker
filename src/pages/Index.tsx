
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import MapView from '@/components/MapView';
import BusList from '@/components/BusList';
import { useBusData } from '@/hooks/useBusData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { buses, isLoading, error, refreshBuses } = useBusData();
  const [selectedBusId, setSelectedBusId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('map');

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(prev => prev === busId ? undefined : busId);
    // Se selecionou um ônibus e estava na lista, muda para o mapa
    if (activeTab === 'list') {
      setActiveTab('map');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="h-full">
            <div className="h-full rounded-lg overflow-hidden">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-red-500 text-center p-4">
                    <p>{error}</p>
                    <button 
                      onClick={refreshBuses}
                      className="mt-2 px-4 py-2 bg-busapp-primary text-white rounded-md"
                    >
                      Tentar novamente
                    </button>
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
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-full h-24" />
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">
                <p>{error}</p>
                <button 
                  onClick={refreshBuses}
                  className="mt-2 px-4 py-2 bg-busapp-primary text-white rounded-md"
                >
                  Tentar novamente
                </button>
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
    </Layout>
  );
};

export default Index;
