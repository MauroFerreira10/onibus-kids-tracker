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
import { Bus, Clock, AlertCircle, MapPin, Users, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DriverDashboard = () => {
  const { buses } = useBusData();
  const { toast } = useToast();
  const [tripStartTime, setTripStartTime] = useState<Date | undefined>();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkDriverRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        navigate('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || data.role !== 'driver') {
        toast({
          title: "Erro",
          description: "Acesso restrito a motoristas",
          variant: "destructive"
        });
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
      <div className="flex flex-col gap-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        {/* Header status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/50 p-4"
        >
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
        </motion.div>
        
        <Tabs defaultValue={vehicle ? "viagens" : "veiculo"} className="w-full">
          <TabsList className="w-full bg-white/80 backdrop-blur-lg rounded-xl p-1 shadow-sm">
            <TabsTrigger value="viagens" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MapPin className="w-4 h-4 mr-2" />
              Viagens
            </TabsTrigger>
            <TabsTrigger value="veiculo" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Bus className="w-4 h-4 mr-2" />
              Veículo
            </TabsTrigger>
            <TabsTrigger value="localizacao" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Localização
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="viagens" className="space-y-4 pt-4 overflow-y-auto max-h-full">
            {/* Route selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/50 p-4"
            >
              <RouteSelector
                routeId={routeId}
                availableRoutes={availableRoutes}
                loadingRoutes={loadingRoutes}
                onSelectRoute={selectRoute}
                disabled={tripStatus === 'in_progress'}
              />
            </motion.div>
            
            {/* Quick Message Buttons */}
            <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/50 p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickMessage("Ônibus atrasado", "delay")}
                className="flex items-center hover:bg-blue-50 transition-colors"
              >
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                Ônibus atrasado
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickMessage("Chegando na rota principal", "arrival")}
                className="flex items-center hover:bg-blue-50 transition-colors"
              >
                <Bus className="h-4 w-4 mr-2 text-blue-600" />
                Chegando na rota principal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickMessage("Problema no trajeto", "alert")}
                className="flex items-center hover:bg-blue-50 transition-colors"
              >
                <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                Problema no trajeto
              </Button>
            </div>
            
            {/* Driver info and bus info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/50 p-4"
              >
                <DriverInfo user={user ? { 
                  id: user.id, 
                  name: user.email?.split('@')[0] || 'Motorista', 
                  email: user.email || '',
                  role: 'driver'
                } : null} vehicle={vehicle} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/50 p-4"
              >
                <RouteInfo 
                  routeId={routeId} 
                  vehicleId={vehicle?.id || ''} 
                  currentStopId={currentStopId}
                />
              </motion.div>
            </div>
            
            {/* Students list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/50 p-4"
            >
              <StudentsList 
                students={students} 
                loadingStudents={loadingStudents} 
                tripStatus={tripStatus} 
                onMarkAsBoarded={markStudentAsBoarded} 
              />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="veiculo" className="pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/50 p-4"
            >
              <VehicleTab 
                vehicle={vehicle}
                loading={loading}
                onRegisterVehicle={() => setShowRegisterVehicle(true)}
              />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="localizacao" className="space-y-4 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/50 p-4"
            >
              <LocationTrackerTab
                vehicle={vehicle}
                isTracking={isTracking}
                setIsTracking={setIsTracking}
                buses={buses}
                selectedBusId={selectedBusId}
                setSelectedBusId={setSelectedBusId}
                onRegisterVehicle={() => setShowRegisterVehicle(true)}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showRegisterVehicle} onOpenChange={setShowRegisterVehicle}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
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
