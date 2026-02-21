// Tipos para os dados da aplicação

// Dados do ônibus
export interface BusData {
  id: string;
  name: string;
  route: string;
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
  status: 'active' | 'inactive' | 'delayed';
  capacity: number;
  occupancy: number;
  currentStop: string;
  nextStop: string;
  estimatedTimeToNextStop: number; // em minutos
  lastUpdate: string; // ISO date string
  onTime: boolean;
  driver?: {
    name: string;
    phone?: string;
    photo?: string;
  };
}

// Dados de parada
export interface StopData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  scheduledTime?: string; // HH:MM format
  estimatedTime?: string; // HH:MM format
  busId?: string;
}

// Dados de rota
export interface RouteData {
  id: string;
  name: string;
  description: string;
  stops: StopData[];
  buses: string[]; // busIds
  schedule: {
    weekdays: string[];
    startTime: string;
    endTime: string;
  };
  status: 'active' | 'completed' | 'pending';
  passengers: number;
  total_stops: number;
}

// Dados do usuário
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'student' | 'driver' | 'manager';
  phone?: string;
  photo?: string;
  children?: {
    id: string;
    name: string;
    routeId: string;
    routeName: string;
    stopId: string;
    stopName: string;
  }[];
  associatedBusId?: string; // para motoristas
  schoolId?: string; // ID da escola associada
}

// Dados específicos de gestor
export interface ManagerData extends UserData {
  role: 'manager';
  permissions?: string[];
  schoolName?: string;
}

// Tipos para autenticação
export interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Tipos para filtros e pesquisas
export interface BusFilters {
  route?: string;
  status?: 'active' | 'inactive' | 'delayed';
  onTime?: boolean;
}

// Tipos para convites e códigos de ativação
export interface Invitation {
  id: string;
  role: 'parent' | 'driver' | 'manager';
  email: string | null;
  activation_code: string;
  created_by: string;
  school_id: string | null;
  used: boolean;
  used_by: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  child_name?: string | null;
  student_number?: string | null;
}

// Dados de estudante
export interface StudentData {
  id: string;
  name: string;
  studentNumber: string;
  grade?: string;
  classroom?: string;
  parentId?: string;
  routeId?: string;
  stopId?: string;
}

// Dados de motorista
export interface DriverData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  busId?: string;
  routes?: string[];
  status: 'active' | 'inactive' | 'onTrip';
  licenseNumber?: string;
}

// Dados de veículo
export interface VehicleData {
  id: string;
  licensePlate: string;
  model: string;
  capacity: number;
  year: string;
  driverId: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenanceDate?: string;
  trackingEnabled: boolean;
  lastLatitude?: number;
  lastLongitude?: number;
  lastLocationUpdate?: string;
}

// Dados de localização
export interface LocationData {
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
  timestamp: string;
  vehicleId: string;
  driverId: string;
}

// Atividades recentes
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface Profile {
  id: string;
  name: string;
  role: 'parent' | 'student' | 'driver' | 'manager';
  contact_number: string | null;
  address: string | null;
  school_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  student_number: string | null;
  route_id: string | null;
  stop_id: string | null;
  grade: string | null;
  classroom: string | null;
  pickup_address: string | null;
  return_address: string | null;
  pickup_time: string | null;
  return_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  student_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripHistory {
  id: string;
  route_id: string;
  vehicle_id: string;
  start_time: string;
  end_time: string;
  completed_stops: number;
  total_stops: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  route_id: string;
  stop_id: string;
  status: 'present' | 'absent' | 'late';
  timestamp: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

