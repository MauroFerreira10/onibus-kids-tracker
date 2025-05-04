
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VehicleData } from '@/types';
import { StudentWithStatus } from '@/types/student';

export const useDriverDashboard = () => {
  const { user } = useAuth();
  const [selectedBusId, setSelectedBusId] = useState<string | undefined>();
  const [students, setStudents] = useState<StudentWithStatus[]>([]);
  const [tripStatus, setTripStatus] = useState<'idle' | 'in_progress' | 'completed'>('idle');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showRegisterVehicle, setShowRegisterVehicle] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  
  // Load driver's vehicle
  useEffect(() => {
    const loadDriverVehicle = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('driver_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Erro ao buscar veículo:', error);
          toast.error('Erro ao carregar informações do veículo');
          return;
        }
        
        if (data) {
          // Map database column names to our VehicleData interface
          const mappedVehicle: VehicleData = {
            id: data.id,
            licensePlate: data.license_plate,
            model: data.model,
            capacity: data.capacity,
            year: data.year,
            driverId: data.driver_id,
            status: data.status,
            trackingEnabled: data.tracking_enabled,
            lastLatitude: data.last_latitude,
            lastLongitude: data.last_longitude,
            lastLocationUpdate: data.last_location_update
          };
          
          setVehicle(mappedVehicle);
          
          // Load students associated with driver's route
          loadStudents();
        }
      } catch (error) {
        console.error('Erro ao buscar veículo:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDriverVehicle();
  }, [user]);
  
  // Load students
  const loadStudents = async () => {
    if (!user) return;
    
    try {
      setLoadingStudents(true);
      
      // Mock data for now since the students table might not exist yet
      const mockStudents: StudentWithStatus[] = [
        {
          id: "1",
          name: "João Silva",
          status: "waiting",
          grade: "5º",
          classroom: "A"
        },
        {
          id: "2",
          name: "Maria Oliveira",
          status: "waiting",
          grade: "6º",
          classroom: "B"
        }
      ];
      
      setStudents(mockStudents);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const startTrip = () => {
    if (!vehicle) {
      toast.error('Você precisa registrar um veículo antes de iniciar uma viagem');
      setShowRegisterVehicle(true);
      return;
    }
    
    setTripStatus('in_progress');
    toast.success('Viagem iniciada com sucesso!');
    
    // If vehicle allows tracking, ask if they want to start
    if (vehicle.trackingEnabled && !isTracking) {
      toast.info('Não se esqueça de ativar o rastreamento de localização para que os pais possam acompanhar a viagem', {
        duration: 5000,
        action: {
          label: 'Ativar',
          onClick: () => setIsTracking(true)
        }
      });
    }
  };
  
  const endTrip = () => {
    setTripStatus('completed');
    setShowEndDialog(false);
    toast.success('Viagem finalizada com sucesso!');
    
    // Disable tracking when trip ends
    setIsTracking(false);
    
    // Reset after a few seconds
    setTimeout(() => {
      setTripStatus('idle');
      setStudents(students.map(s => ({ ...s, status: 'waiting' })));
    }, 5000);
  };
  
  const markStudentAsBoarded = (studentId: string) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, status: 'boarded' } : student
    ));
    toast.success('Aluno marcado como embarcado!');
  };
  
  const handleVehicleRegistered = (newVehicle: VehicleData) => {
    setVehicle(newVehicle);
    setShowRegisterVehicle(false);
    
    // Sugestão para ativar o rastreamento ao registrar um novo veículo
    if (newVehicle.trackingEnabled) {
      toast.success('Veículo registrado com sucesso! O rastreamento está disponível.', {
        duration: 5000,
        action: {
          label: 'Ativar Agora',
          onClick: () => setIsTracking(true)
        }
      });
    }
  };

  return {
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
    startTrip,
    endTrip,
    markStudentAsBoarded,
    handleVehicleRegistered
  };
};
