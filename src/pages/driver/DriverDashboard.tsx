import React, { useState, useEffect } from 'react';
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
import RouteSelector from '@/components/driver/dashboard/RouteSelector';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { Button } from '@/components/ui/button';
import { Bus, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
  const { buses } = useBusData();
  const { toast } = useToast();
  const [tripStartTime, setTripStartTime] = useState<Date | undefined>();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkDriverRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        navigate('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || data.role !== 'driver') {
        toast.error('Acesso restrito a motoristas');
        navigate('/');
      }
    };

    checkDriverRole();
  }, [navigate, toast]);

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
    availableRoutes,
    loadingRoutes,
    selectRoute,
    startTrip: originalStartTrip,
    endTrip: originalEndTrip,
    markStudentAsBoarded,
    handleVehicleRegistered,
    currentStopId,
    setCurrentStopId
  } = useDriverDashboard();

  const currentRoute = availableRoutes.find(route => route.id === routeId);

  // Sobrescrever as funções startTrip e endTrip para gerenciar o tripStartTime
  const startTrip = () => {
    setTripStartTime(new Date());
    originalStartTrip();
  };

  const endTrip = () => {
    originalEndTrip();
    setTripStartTime(undefined);
  };

  const sendQuickMessage = async (message: string, type: string) => {
    if (!user) return;
    
    try {
      // Calculate expiration date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      const notification = {
        type,
        message,
        time: new Date().toISOString(),
        read: false,
        icon: type === 'delay' ? 'clock' : type === 'arrival' ? 'bus' : 'alert',
        user_id: user.id,
        sender_role: 'driver',
        expires_at: expiresAt.toISOString()
      };

      const { error } = await supabase
        .from('notifications')
        .insert(notification);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Mensagem enviada com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
    }
  };
  
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
          currentRoute={currentRoute}
          tripStartTime={tripStartTime}
        />
        
        <Tabs defaultValue={vehicle ? "viagens" : "veiculo"} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="viagens" className="flex-1">Viagens</TabsTrigger>
            <TabsTrigger value="veiculo" className="flex-1">Veículo</TabsTrigger>
            <TabsTrigger value="localizacao" className="flex-1">Localização</TabsTrigger>
          </TabsList>
          
          <TabsContent value="viagens" className="space-y-4 pt-4 overflow-y-auto max-h-full">
            {/* Route selector (new component) */}
            <RouteSelector
              routeId={routeId}
              availableRoutes={availableRoutes}
              loadingRoutes={loadingRoutes}
              onSelectRoute={selectRoute}
              disabled={tripStatus === 'in_progress'}
            />
            
            {/* Quick Message Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickMessage("Ônibus atrasado", "delay")}
                className="flex items-center"
              >
                <Clock className="h-4 w-4 mr-2" />
                Ônibus atrasado
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickMessage("Chegando na rota principal", "arrival")}
                className="flex items-center"
              >
                <Bus className="h-4 w-4 mr-2" />
                Chegando na rota principal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickMessage("Problema no trajeto", "alert")}
                className="flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Problema no trajeto
              </Button>
            </div>
            
            {/* Driver info and bus info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DriverInfo user={user ? { 
                id: user.id, 
                name: user.email?.split('@')[0] || 'Motorista', 
                email: user.email || '',
                role: 'driver'
              } : null} vehicle={vehicle} />
              <RouteInfo 
                routeId={routeId} 
                vehicleId={vehicle?.id || ''} 
                currentStopId={currentStopId}
              />
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
