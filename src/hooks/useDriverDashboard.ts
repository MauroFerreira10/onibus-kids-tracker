import { useState, useEffect, useCallback } from 'react';
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
  const [routeId, setRouteId] = useState<string | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<Array<{id: string, name: string}>>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  
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
            status: data.status as 'active' | 'maintenance' | 'inactive',
            trackingEnabled: data.tracking_enabled,
            lastLatitude: data.last_latitude,
            lastLongitude: data.last_longitude,
            lastLocationUpdate: data.last_location_update
          };
          
          setVehicle(mappedVehicle);
          
          // Load available routes
          loadAvailableRoutes();
          
          // Check if driver has a route assigned
          const { data: routeData, error: routeError } = await supabase
            .from('routes')
            .select('id')
            .eq('driver_id', user.id)
            .eq('vehicle_id', data.id)
            .maybeSingle();
          
          if (!routeError && routeData) {
            setRouteId(routeData.id);
            // Load students associated with driver's route
            loadStudents(routeData.id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar veículo:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDriverVehicle();
  }, [user]);
  
  // Load available routes
  const loadAvailableRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const { data, error } = await supabase
        .from('routes')
        .select('id, name');
        
      if (error) {
        console.error('Erro ao buscar rotas disponíveis:', error);
        return;
      }
      
      setAvailableRoutes(data || []);
    } catch (error) {
      console.error('Erro ao buscar rotas:', error);
    } finally {
      setLoadingRoutes(false);
    }
  };
  
  // Select a route for the driver
  const selectRoute = async (selectedRouteId: string) => {
    if (!user || !vehicle) {
      toast.error('Você precisa ter um veículo registrado para selecionar uma rota');
      return;
    }
    
    try {
      // Update the route with the driver and vehicle information
      const { error } = await supabase
        .from('routes')
        .update({
          driver_id: user.id,
          vehicle_id: vehicle.id
        })
        .eq('id', selectedRouteId);
        
      if (error) {
        console.error('Erro ao selecionar rota:', error);
        toast.error('Não foi possível selecionar esta rota');
        return;
      }
      
      // Update local state
      setRouteId(selectedRouteId);
      toast.success('Rota selecionada com sucesso!');
      
      // Load students for this route
      loadStudents(selectedRouteId);
    } catch (error) {
      console.error('Erro ao selecionar rota:', error);
      toast.error('Erro ao atribuir rota ao motorista');
    }
  };
  
  // Load students with real-time updates for attendance
  const loadStudents = async (routeIdToLoad: string) => {
    if (!user || !routeIdToLoad) return;
    
    try {
      setLoadingStudents(true);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch students assigned to this route
      const { data, error } = await supabase
        .from('students')
        .select('id, name, grade, classroom, pickup_address, stop_id')
        .eq('route_id', routeIdToLoad);
      
      if (error) {
        console.error('Erro ao buscar alunos:', error);
        setStudents([]);
        return;
      }
      
      if (!data || data.length === 0) {
        setStudents([]);
        return;
      }
      
      // Fetch attendance records for today
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('student_attendance')
        .select('student_id, status')
        .eq('trip_date', today)
        .in('student_id', data.map(s => s.id));
      
      if (attendanceError) {
        console.error('Erro ao buscar registros de presença:', attendanceError);
      }
      
      // Map students with their attendance status
      const studentsWithStatus: StudentWithStatus[] = data.map(student => {
        const attendance = attendanceData?.find(a => a.student_id === student.id);
        return {
          id: student.id,
          name: student.name,
          grade: student.grade || 'N/A',
          classroom: student.classroom || 'N/A',
          pickupAddress: student.pickup_address || 'Endereço não registrado',
          stopId: student.stop_id,
          status: (attendance?.status as StudentWithStatus['status']) || 'waiting'
        };
      });
      
      setStudents(studentsWithStatus);
      
      // Set up real-time subscription for attendance updates
      const channel = supabase
        .channel('student-attendance-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'student_attendance',
          filter: `trip_date=eq.${today}`
        }, (payload) => {
          console.log('Attendance update:', payload);
          // Update local state when attendance changes
          if (payload.new && payload.new.student_id) {
            setStudents(current => 
              current.map(student => 
                student.id === payload.new.student_id 
                  ? { ...student, status: payload.new.status as StudentWithStatus['status'] }
                  : student
              )
            );
          }
        })
        .subscribe();
        
      // Clean up subscription
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const startTrip = async () => {
    if (!vehicle) {
      toast.error('Você precisa registrar um veículo antes de iniciar uma viagem');
      setShowRegisterVehicle(true);
      return;
    }
    
    if (!routeId) {
      toast.error('Você não tem uma rota atribuída ao seu veículo');
      return;
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Create attendance records for all students who don't have one yet
    for (const student of students) {
      const { data: existing } = await supabase
        .from('student_attendance')
        .select('id')
        .eq('student_id', student.id)
        .eq('trip_date', today)
        .maybeSingle();
      
      if (!existing) {
        // Create a new attendance record
        await supabase
          .from('student_attendance')
          .insert({
            student_id: student.id,
            trip_date: today,
            status: 'waiting',
            marked_by: user?.id,
            stop_id: student.stopId
          });
      }
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
  
  const endTrip = async () => {
    // Mark all 'waiting' students as 'absent'
    if (students.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      
      for (const student of students) {
        if (student.status === 'waiting') {
          await supabase
            .from('student_attendance')
            .update({ status: 'absent' })
            .eq('student_id', student.id)
            .eq('trip_date', today);
        }
      }
    }
    
    setTripStatus('completed');
    setShowEndDialog(false);
    toast.success('Viagem finalizada com sucesso!');
    
    // Disable tracking when trip ends
    setIsTracking(false);
    
    // Reset after a few seconds
    setTimeout(() => {
      setTripStatus('idle');
      // Reload students to get fresh status
      if (routeId) {
        loadStudents(routeId);
      }
    }, 5000);
  };
  
  const markStudentAsBoarded = async (studentId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Update the attendance record in the database
      const { error } = await supabase
        .from('student_attendance')
        .update({ 
          status: 'boarded',
          marked_at: new Date().toISOString(),
          marked_by: user?.id
        })
        .eq('student_id', studentId)
        .eq('trip_date', today);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setStudents(students.map(student => 
        student.id === studentId ? { ...student, status: 'boarded' } : student
      ));
      
      toast.success('Aluno marcado como embarcado!');
    } catch (error) {
      console.error('Erro ao marcar aluno como embarcado:', error);
      toast.error('Erro ao atualizar status do aluno');
    }
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
    routeId,
    availableRoutes,
    loadingRoutes,
    selectRoute,
    startTrip,
    endTrip,
    markStudentAsBoarded,
    handleVehicleRegistered
  };
};
