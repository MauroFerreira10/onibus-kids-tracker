
import React from 'react';
import Layout from '@/components/Layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useBusData } from '@/hooks/useBusData';
import RegisterVehicleForm from '@/components/driver/RegisterVehicleForm';
import TripStatusHeader from '@/components/driver/dashboard/TripStatusHeader';
import DriverInfo from '@/components/driver/dashboard/DriverInfo';
import RouteInfo from '@/components/driver/dashboard/RouteInfo';
import StudentsList from '@/components/driver/dashboard/StudentsList';
import VehicleTab from '@/components/driver/dashboard/VehicleTab';
import LocationTrackerTab from '@/components/driver/dashboard/LocationTrackerTab';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';

const DriverDashboard = () => {
  const { buses } = useBusData();
  const {
    user,
    selectedBusId,
    setSelectedBusId,
    students,
    tripStatus,
    showEndDialog,
    setShowEndDialog,
    vehicle,
    loading,
    loadingStudents,
    showRegisterVehicle,
    setShowRegisterVehicle,
    isTracking,
    setIsTracking,
    routeId,
    startTrip,
    endTrip,
    markStudentAsBoarded,
    handleVehicleRegistered
  } = useDriverDashboard();
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header status */}
        <TripStatusHeader
          tripStatus={tripStatus}
          vehicle={vehicle}
          showEndDialog={showEndDialog}
          setShowEndDialog={setShowEndDialog}
          startTrip={startTrip}
          endTrip={endTrip}
        />
        
        <Tabs defaultValue={vehicle ? "viagens" : "veiculo"} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="viagens" className="flex-1">Viagens</TabsTrigger>
            <TabsTrigger value="veiculo" className="flex-1">Veículo</TabsTrigger>
            <TabsTrigger value="localizacao" className="flex-1">Localização</TabsTrigger>
          </TabsList>
          
          <TabsContent value="viagens" className="space-y-4 pt-4">
            {/* Driver info and bus info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DriverInfo user={user ? { 
                id: user.id, 
                name: user.email?.split('@')[0] || 'Motorista', 
                email: user.email || '',
                role: 'driver'
              } : null} vehicle={vehicle} />
              <RouteInfo routeId={routeId} />
            </div>
            
            {/* Students list */}
            <StudentsList 
              students={students} 
              loadingStudents={loadingStudents} 
              tripStatus={tripStatus} 
              onMarkAsBoarded={markStudentAsBoarded} 
            />
          </TabsContent>
          
          <TabsContent value="veiculo" className="pt-4">
            <VehicleTab 
              vehicle={vehicle}
              loading={loading}
              onRegisterVehicle={() => setShowRegisterVehicle(true)}
            />
          </TabsContent>
          
          <TabsContent value="localizacao" className="space-y-4 pt-4">
            <LocationTrackerTab
              vehicle={vehicle}
              isTracking={isTracking}
              setIsTracking={setIsTracking}
              buses={buses}
              selectedBusId={selectedBusId}
              setSelectedBusId={setSelectedBusId}
              onRegisterVehicle={() => setShowRegisterVehicle(true)}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showRegisterVehicle} onOpenChange={setShowRegisterVehicle}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {vehicle ? 'Atualizar Veículo' : 'Registrar Veículo'}
            </DialogTitle>
          </DialogHeader>
          <RegisterVehicleForm 
            existingVehicle={vehicle}
            onVehicleRegistered={handleVehicleRegistered}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DriverDashboard;
