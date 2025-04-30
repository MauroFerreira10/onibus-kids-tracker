
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
  email?: string; 
  role: 'parent' | 'student' | 'driver' | 'manager';
  activation_code: string;
  created_at: string;
  expires_at?: string;
  used: boolean;
  used_by?: string;
  child_name?: string;
  student_number?: string;
  school_id?: string;
  created_by: string;
}
