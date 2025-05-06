
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RouteData } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      
      // Fetch routes from database
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('*');
      
      if (routesError) throw routesError;
      
      if (!routesData || routesData.length === 0) {
        setRoutes([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch stops for all routes
      const { data: stopsData, error: stopsError } = await supabase
        .from('stops')
        .select('*')
        .in('route_id', routesData.map(r => r.id))
        .order('sequence_number', { ascending: true });
      
      if (stopsError) throw stopsError;
      
      // Organize data into the expected format
      const mappedRoutes: RouteData[] = routesData.map(route => {
        // Find stops for this route
        const routeStops = stopsData?.filter(stop => stop.route_id === route.id) || [];
        
        return {
          id: route.id,
          name: route.name,
          description: route.description || 'Rota escolar',
          buses: [route.vehicle_id].filter(Boolean) as string[],
          stops: routeStops.map(stop => ({
            id: stop.id,
            name: stop.name,
            address: stop.address,
            latitude: stop.latitude || 0,
            longitude: stop.longitude || 0,
            scheduledTime: stop.estimated_time || '08:00',
            estimatedTime: stop.estimated_time || '08:00'
          })),
          schedule: {
            weekdays: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'],
            startTime: '07:00',
            endTime: '08:30'
          }
        };
      });
      
      setRoutes(mappedRoutes);
      
      // If the user is logged in, fetch their attendance status
      if (user) {
        fetchAttendanceStatus();
      }
    } catch (error) {
      console.error('Erro ao buscar rotas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as rotas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch the current user's student profile
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, stop_id')
        .eq('parent_id', user?.id)
        .maybeSingle();
      
      if (studentError) {
        console.error('Error fetching student data:', studentError);
        return;
      }
      
      if (!studentData) return;
      
      // Fetch attendance status for today
      const { data: attendanceData, error } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('student_id', studentData.id)
        .eq('trip_date', today);
      
      if (error) {
        console.error('Error fetching attendance:', error);
        return;
      }
      
      if (attendanceData && attendanceData.length > 0) {
        const statusMap: Record<string, string> = {};
        
        // Map attendance records to stop IDs
        // Since stop_id is not in student_attendance, we use the student's assigned stop_id
        if (studentData.stop_id) {
          const latestRecord = attendanceData[attendanceData.length - 1];
          statusMap[studentData.stop_id] = latestRecord.status;
        }
        
        setAttendanceStatus(statusMap);
      }
    } catch (error) {
      console.error('Erro ao buscar status de presença:', error);
    }
  };

  const markPresentAtStop = async (stopId: string) => {
    try {
      if (!user) {
        toast({
          title: "Atenção",
          description: "Você precisa estar logado para marcar presença.",
          variant: "default"
        });
        return;
      }
      
      // First check if the student profile exists
      let { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', user.id)
        .maybeSingle();
      
      if (studentError) {
        console.error('Error fetching student:', studentError);
        toast({
          title: "Erro",
          description: "Não foi possível verificar seu perfil de estudante.",
          variant: "destructive"
        });
        return;
      }
      
      // If no student profile is found, create one with basic information
      if (!studentData) {
        try {
          // Get stop information to find the route_id
          const { data: stopData, error: stopError } = await supabase
            .from('stops')
            .select('route_id, name')
            .eq('id', stopId)
            .maybeSingle();
            
          if (stopError || !stopData) {
            console.error('Error fetching stop:', stopError);
            toast({
              title: "Erro",
              description: "Não foi possível obter informações sobre o ponto de embarque.",
              variant: "destructive"
            });
            return;
          }
          
          const studentName = user.email?.split('@')[0] || 'Estudante';
          
          // Create a new student profile
          const { data: newStudent, error: createError } = await supabase
            .from('students')
            .insert({
              parent_id: user.id,
              name: studentName,
              stop_id: stopId,
              route_id: stopData.route_id,
              pickup_address: stopData.name
            })
            .select('id')
            .single();
          
          if (createError) {
            console.error('Error creating student profile:', createError);
            throw new Error('Não foi possível criar um perfil de estudante');
          }
          
          studentData = newStudent;
          console.log('Created new student profile:', newStudent);
          
          toast({
            title: "Sucesso",
            description: "Perfil de estudante criado automaticamente.",
            variant: "default"
          });
        } catch (error) {
          console.error('Detailed error:', error);
          toast({
            title: "Erro",
            description: "Não foi possível criar um perfil de estudante. Por favor, contacte a administração.",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Update existing student's stop_id
        const { error: updateError } = await supabase
          .from('students')
          .update({ stop_id: stopId })
          .eq('id', studentData.id);
          
        if (updateError) {
          console.error('Error updating student stop:', updateError);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o ponto de embarque.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Process the attendance for the existing student
      if (studentData && studentData.id) {
        await markAttendance(studentData.id, stopId);
      } else {
        throw new Error('Dados do estudante não encontrados após criação');
      }
      
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível marcar presença. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const markAttendance = async (studentId: string, stopId: string) => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Check if there's already a record for today
      const { data: existingRecord } = await supabase
        .from('student_attendance')
        .select('id, status')
        .eq('student_id', studentId)
        .eq('trip_date', today)
        .maybeSingle();
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('student_attendance')
          .update({ 
            status: 'present_at_stop',
            marked_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('student_attendance')
          .insert({
            student_id: studentId,
            trip_date: today,
            status: 'present_at_stop',
            marked_by: user?.id
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setAttendanceStatus(prev => ({
        ...prev,
        [stopId]: 'present_at_stop'
      }));
      
      toast({
        title: "Sucesso",
        description: "Presença confirmada neste ponto de embarque!",
        variant: "default"
      });
      
      // Refresh attendance status
      fetchAttendanceStatus();
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar presença. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return {
    routes,
    isLoading,
    attendanceStatus,
    markPresentAtStop,
  };
};
