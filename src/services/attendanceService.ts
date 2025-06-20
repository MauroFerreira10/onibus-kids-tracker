import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches the user's attendance status for the last 7 days
 */
export const fetchUserAttendanceStatus = async (userId: string) => {
  if (!userId) return {};
  
  // Get today's date and 7 days ago in YYYY-MM-DD format
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  const todayStr = today.toISOString().split('T')[0];
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
  // Call the stored procedure as an RPC function
  const { data: attendanceData, error } = await supabase
    .from('attendance_simple')
    .select('stop_id, date')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgoStr)
    .lte('date', todayStr)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching attendance:', error);
    return {};
  }
  
  if (attendanceData && attendanceData.length > 0) {
    const statusMap: Record<string, string> = {};
    
    // Map each stop attendance status
    attendanceData.forEach((record: {stop_id: string}) => {
      statusMap[record.stop_id] = 'present_at_stop';
    });
    
    return statusMap;
  }
  
  return {};
};

/**
 * Records user attendance at a specific stop
 */
export const markUserPresenceAtStop = async (userId: string, stopId: string, stopData: any) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Call the stored procedure as an RPC function
  const { data, error: insertError } = await supabase
    .rpc('record_user_attendance', {
      user_id_param: userId,
      stop_id_param: stopId,
      route_id_param: stopData.route_id,
      date_param: today
    });
  
  if (insertError) {
    // Check if it's a duplicate record error
    if (insertError.message.includes('duplicate key') || insertError.message.includes('already exists')) {
      throw new Error('DUPLICATE_RECORD');
    }
    
    throw insertError;
  }

  // Atualiza o stop_id do estudante
  const { error: updateError } = await supabase
    .from('students')
    .update({ stop_id: stopId })
    .eq('id', userId);

  if (updateError) {
    console.error('Erro ao atualizar stop_id do estudante:', updateError);
    // Não lançamos erro aqui para não interromper o fluxo principal
  }
  
  return data;
};
