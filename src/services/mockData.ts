
import { BusData, RouteData, StopData, UserData } from '@/types';

// Função para gerar dados simulados de ônibus
export function generateMockBuses(): BusData[] {
  const buses: BusData[] = [
    {
      id: 'bus-001',
      name: 'Ônibus 101',
      route: 'Rota A',
      latitude: -14.9167,
      longitude: 13.4925, // Lubango
      speed: 25,
      direction: 90,
      status: 'active',
      capacity: 45,
      occupancy: 32,
      currentStop: 'Faculdade ISPI',
      nextStop: 'Reitoria da Mandume',
      estimatedTimeToNextStop: 5,
      lastUpdate: new Date().toISOString(),
      onTime: true,
      driver: {
        name: 'João Silva',
        phone: '11 98765-4321',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    },
    {
      id: 'bus-002',
      name: 'Ônibus 202',
      route: 'Rota B',
      latitude: -14.9200,
      longitude: 13.4960, // Lubango, um pouco deslocado
      speed: 0,
      direction: 180,
      status: 'active',
      capacity: 45,
      occupancy: 38,
      currentStop: 'Reitoria da Mandume',
      nextStop: 'Bairro do Tchioco',
      estimatedTimeToNextStop: 12,
      lastUpdate: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutos atrás
      onTime: false,
      driver: {
        name: 'Maria Oliveira',
        phone: '11 91234-5678',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg'
      }
    },
    {
      id: 'bus-003',
      name: 'Ônibus 303',
      route: 'Rota C',
      latitude: -14.9300,
      longitude: 13.4890, // Lubango, mais deslocado
      speed: 15,
      direction: 270,
      status: 'delayed',
      capacity: 40,
      occupancy: 35,
      currentStop: 'Bairro do Tchioco',
      nextStop: 'Faculdade ISPI',
      estimatedTimeToNextStop: 8,
      lastUpdate: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutos atrás
      onTime: false,
      driver: {
        name: 'Carlos Mendes',
        phone: '11 95555-9999'
      }
    },
  ];
  
  return buses;
}

// Função para gerar paradas simuladas
export function generateMockStops(): StopData[] {
  const stops: StopData[] = [
    {
      id: 'stop-001',
      name: 'Faculdade ISPI',
      address: 'Faculdade ISPI, Lubango',
      latitude: -14.9167,
      longitude: 13.4925,
      scheduledTime: '07:30',
      estimatedTime: '07:30'
    },
    {
      id: 'stop-002',
      name: 'Reitoria da Mandume',
      address: 'Reitoria da Mandume, Lubango',
      latitude: -14.9200,
      longitude: 13.4960,
      scheduledTime: '07:45',
      estimatedTime: '07:50'
    },
    {
      id: 'stop-003',
      name: 'Bairro do Tchioco',
      address: 'Bairro do Tchioco, Lubango',
      latitude: -14.9300,
      longitude: 13.4890,
      scheduledTime: '08:00',
      estimatedTime: '08:15'
    }
  ];
  
  return stops;
}

// Função para gerar rotas simuladas
export function generateMockRoutes(): RouteData[] {
  const stops = generateMockStops();
  
  const routes: RouteData[] = [
    {
      id: 'route-001',
      name: 'ISPI - Mandume',
      description: 'Faculdade ISPI → Reitoria da Mandume',
      stops: [stops[0], stops[1]],
      buses: ['bus-001'],
      schedule: {
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '07:00',
        endTime: '18:00'
      }
    },
    {
      id: 'route-002',
      name: 'ISPI - Tchioco',
      description: 'Faculdade ISPI → Bairro do Tchioco',
      stops: [stops[0], stops[2]],
      buses: ['bus-002'],
      schedule: {
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '07:00',
        endTime: '18:00'
      }
    },
    {
      id: 'route-003',
      name: 'Tchioco - ISPI',
      description: 'Bairro do Tchioco → Faculdade ISPI',
      stops: [stops[2], stops[0]],
      buses: ['bus-003'],
      schedule: {
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '07:00',
        endTime: '18:00'
      }
    },
  ];
  
  return routes;
}

// Função para gerar usuários simulados
export function generateMockUsers(): UserData[] {
  const users: UserData[] = [
    {
      id: 'user-001',
      name: 'Roberto Pereira',
      email: 'roberto@exemplo.com',
      role: 'parent',
      phone: '11 91111-2222',
      children: [
        {
          id: 'child-001',
          name: 'Lucas Pereira',
          routeId: 'route-001',
          routeName: 'Rota A',
          stopId: 'stop-001',
          stopName: 'Escola Municipal'
        }
      ]
    },
    {
      id: 'user-002',
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      role: 'manager',
      phone: '11 93333-4444'
    },
    {
      id: 'user-003',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      role: 'driver',
      phone: '11 95555-6666',
      associatedBusId: 'bus-001'
    }
  ];
  
  return users;
}

// Simulação de atualização das posições dos ônibus
export function updateBusPositions(buses: BusData[]): BusData[] {
  return buses.map(bus => {
    // Somente atualiza ônibus ativos com velocidade > 0
    if (bus.status === 'active' && bus.speed > 0) {
      // Cálculo simplificado para simular movimento
      // Na vida real, seria baseado em direção e velocidade reais
      const latChange = (Math.random() * 0.002 - 0.001) * bus.speed / 10;
      const lngChange = (Math.random() * 0.002 - 0.001) * bus.speed / 10;
      
      return {
        ...bus,
        latitude: bus.latitude + latChange,
        longitude: bus.longitude + lngChange,
        lastUpdate: new Date().toISOString()
      };
    }
    return bus;
  });
}

// Simulação de atraso para ônibus
export function simulateDelays(buses: BusData[]): BusData[] {
  return buses.map(bus => {
    // 15% de chance de atraso para cada ônibus
    if (Math.random() < 0.15) {
      return {
        ...bus,
        status: 'delayed' as const,
        onTime: false,
        estimatedTimeToNextStop: bus.estimatedTimeToNextStop + Math.floor(Math.random() * 10) + 5
      };
    }
    return bus;
  });
}
