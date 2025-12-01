import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VehicleData } from '@/types';
import { StudentWithStatus } from '@/types/student';
import { StudentBoardingStatus } from '@/types/student';

interface Route {
  id: string;
  name: string;
  total_stops: number;
}

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
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [currentStopId, setCurrentStopId] = useState<string | undefined>();
  
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
          fetchRoutes();
          
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
  
  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const { data, error } = await supabase
        .from('routes')
        .select('id, name, total_stops')
        .order('name');

      if (error) {
        throw error;
      }

      // Se total_stops não estiver disponível, calcula baseado nos alunos
      const routesWithStops = await Promise.all((data || []).map(async (route) => {
        if (route.total_stops !== undefined) {
          return route;
        }

        // Conta o número de paradas únicas para esta rota
        const { count } = await supabase
          .from('students')
          .select('stop_id', { count: 'exact', head: true })
          .eq('route_id', route.id)
          .not('stop_id', 'is', null);

        return {
          ...route,
          total_stops: count || 0
        };
      }));

      setAvailableRoutes(routesWithStops);
    } catch (error) {
      console.error('Erro ao buscar rotas:', error);
      toast.error('Erro ao carregar rotas');
    } finally {
      setLoadingRoutes(false);
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
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, grade, classroom, pickup_address, stop_id')
        .eq('route_id', routeIdToLoad);

      if (studentsError) {
        console.error('Erro ao buscar alunos:', studentsError);
        setStudents([]);
        return;
      }
      
      if (!studentsData || studentsData.length === 0) {
        console.log('LoadStudents: Nenhum aluno encontrado para a rota', routeIdToLoad);
        setStudents([]);
        return;
      }

      // Fetch attendance records from both tables
      const [attendanceRecords, attendanceSimple] = await Promise.all([
        supabase
          .from('student_attendance')
          .select('student_id, status, trip_date')
          .eq('trip_date', today)
          .eq('route_id', routeIdToLoad),
        supabase
          .from('attendance_simple')
          .select('user_id, status, date')
          .eq('date', today)
          .eq('route_id', routeIdToLoad)
      ]);

      if (attendanceRecords.error) {
        console.error('Erro ao buscar registros de presença:', attendanceRecords.error);
      }

      if (attendanceSimple.error) {
        console.error('Erro ao buscar registros simples de presença:', attendanceSimple.error);
      }
      
      // Combine attendance data from both tables
      const allAttendanceData = [
        ...(attendanceRecords.data || []).map(record => ({
          student_id: record.student_id,
          status: record.status
        })),
        ...(attendanceSimple.data || []).map(record => ({
          student_id: record.user_id,
          status: record.status
        }))
      ];

      const studentsWithStatus: StudentWithStatus[] = studentsData
        .map(student => {
          const attendance = allAttendanceData.find(a => a.student_id === student.id);
          const status = (attendance?.status as StudentBoardingStatus) || 'waiting';
          return {
            id: student.id,
            name: student.name,
            grade: student.grade || 'N/A',
            classroom: student.classroom || 'N/A',
            pickupAddress: student.pickup_address || 'Endereço não registrado',
            stopId: student.stop_id,
            status
          };
        })
        // Filtrar alunos com status 'boarded' para não aparecerem na lista
        .filter(student => student.status !== 'boarded');
      
      setStudents(studentsWithStatus);

      // Subscribe to real-time updates for both attendance tables
      const subscription = supabase
        .channel('student_attendance_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'student_attendance',
            filter: `route_id=eq.${routeIdToLoad}`
          },
          async () => {
            loadStudents(routeIdToLoad);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'attendance_simple',
            filter: `route_id=eq.${routeIdToLoad}`
          },
          async () => {
            loadStudents(routeIdToLoad);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Erro no loadStudents:', error);
      setStudents([]);
      toast.error('Erro ao carregar lista de alunos.');
    } finally {
      setLoadingStudents(false);
    }
  };
  
  // Select a route for the driver
  const selectRoute = useCallback(async (newRouteId: string) => {
    try {
      setLoadingRoutes(true);
      
      // Atualiza a rota com o motorista e veículo
      if (vehicle?.id && user?.id) {
        const { error } = await supabase
          .from('routes')
          .update({
            driver_id: user.id,
            vehicle_id: vehicle.id
          })
          .eq('id', newRouteId);
        
        if (error) throw error;
      }
      
      setRouteId(newRouteId);
      
      // Busca a primeira parada da rota
      const { data: stops, error: stopsError } = await supabase
        .from('stops')
        .select('id')
        .eq('route_id', newRouteId)
        .order('sequence_number', { ascending: true })
        .limit(1);
      
      if (stopsError) throw stopsError;
      
      if (stops && stops.length > 0) {
        setCurrentStopId(stops[0].id);
      }
      
      // Carrega os alunos da rota
      loadStudents(newRouteId);
      
      toast.success('Rota selecionada com sucesso!');
    } catch (error) {
      console.error('Erro ao selecionar rota:', error);
      toast.error('Erro ao selecionar rota');
    } finally {
      setLoadingRoutes(false);
    }
  }, [vehicle?.id, user?.id, loadStudents]);
  
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
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      const startTime = new Date();
      
      // Criar registro no histórico automaticamente
      const { data: tripHistoryData, error: historyError } = await supabase
        .rpc('create_trip_history_on_start', {
          p_route_id: routeId,
          p_vehicle_id: vehicle.id,
          p_start_time: startTime.toISOString()
        });
      
      if (historyError) {
        console.error('Erro ao criar histórico de viagem:', historyError);
        // Não bloqueia o início da viagem, apenas loga o erro
      }
      
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
              stop_id: student.stopId,
              route_id: routeId
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
    } catch (error) {
      console.error('Erro ao iniciar viagem:', error);
      toast.error('Erro ao iniciar viagem');
    }
  };
  
  const endTrip = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Marcar alunos 'waiting' como 'absent'
      if (students.length > 0) {
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

      // Remover todos os alunos marcados como 'boarded' ao finalizar viagem
      if (routeId) {
        // Remover de student_attendance
        await supabase
          .from('student_attendance')
          .delete()
          .eq('route_id', routeId)
          .eq('trip_date', today)
          .eq('status', 'boarded');

        // Remover de attendance_simple
        await supabase
          .from('attendance_simple')
          .delete()
          .eq('route_id', routeId)
          .eq('date', today)
          .eq('status', 'boarded');
      }
      
      setTripStatus('completed');
      setShowEndDialog(false);
      toast.success('Viagem finalizada com sucesso! Alunos embarcados foram removidos.');
      
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
    } catch (error) {
      console.error('Erro ao finalizar viagem:', error);
      toast.error('Erro ao finalizar viagem');
    }
  };
  
  const markStudentAsBoarded = async (studentId: string) => {
    try {
      console.log('markStudentAsBoarded chamado para aluno:', studentId);
      
      if (!routeId) {
        console.error('Erro: Nenhuma rota selecionada');
        toast.error('Nenhuma rota selecionada');
        return;
      }

      if (!user?.id) {
        console.error('Erro: Usuário não autenticado');
        toast.error('Usuário não autenticado');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      console.log('Data de hoje:', today, 'Route ID:', routeId);
      
      // Verificar se já existe registro de presença
      const { data: existingAttendance } = await supabase
        .from('student_attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('trip_date', today)
        .maybeSingle();

      // Criar ou atualizar registro em student_attendance
      if (existingAttendance) {
        const { error: updateError } = await supabase
          .from('student_attendance')
          .update({ 
            status: 'boarded',
            marked_at: new Date().toISOString(),
            marked_by: user?.id,
            route_id: routeId
          })
          .eq('id', existingAttendance.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('student_attendance')
          .insert({
            student_id: studentId,
            trip_date: today,
            status: 'boarded',
            marked_at: new Date().toISOString(),
            marked_by: user?.id,
            route_id: routeId
          });
        
        if (insertError) throw insertError;
      }

      // Verificar se existe em attendance_simple e atualizar ou criar
      const { data: existingSimple } = await supabase
        .from('attendance_simple')
        .select('id')
        .eq('user_id', studentId)
        .eq('date', today)
        .maybeSingle();

      if (existingSimple) {
        const { error: updateSimpleError } = await supabase
          .from('attendance_simple')
          .update({ 
            status: 'boarded',
            created_at: new Date().toISOString()
          })
          .eq('id', existingSimple.id);
        
        if (updateSimpleError) throw updateSimpleError;
      } else {
        // Buscar stop_id do aluno
        const { data: studentData } = await supabase
          .from('students')
          .select('stop_id')
          .eq('id', studentId)
          .single();

        if (studentData?.stop_id) {
          const { error: insertSimpleError } = await supabase
            .from('attendance_simple')
            .insert({
              user_id: studentId,
              stop_id: studentData.stop_id,
              route_id: routeId,
              date: today,
              status: 'boarded',
              created_at: new Date().toISOString()
            });
          
          if (insertSimpleError) {
            console.error('Erro ao inserir em attendance_simple:', insertSimpleError);
            // Não lançar erro aqui, apenas logar
          }
        } else {
          console.warn('Aluno sem stop_id, não foi possível criar registro em attendance_simple');
        }
      }
      
      // Recarregar lista de alunos para atualizar o estado
      if (routeId) {
        await loadStudents(routeId);
      }
      
      toast.success('Aluno marcado como embarcado!');
    } catch (error: any) {
      console.error('Erro ao marcar aluno como embarcado:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      console.error('Detalhes do erro:', errorMessage);
      toast.error(`Erro ao atualizar status do aluno: ${errorMessage}`);
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
    handleVehicleRegistered,
    currentStopId,
    setCurrentStopId,
  };
};
