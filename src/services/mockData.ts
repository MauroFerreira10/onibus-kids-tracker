import { StopData, RouteData } from '@/types';

// Mock function to generate bus data
export const generateMockBuses = (count: number = 5) => {
  const buses = [];
  for (let i = 1; i <= count; i++) {
    buses.push({
      id: i.toString(),
      name: `Bus ${i}`,
      route: `Route ${i % 3 + 1}`,
      latitude: -8.837 + Math.random() * 0.1,
      longitude: 13.245 + Math.random() * 0.1,
      speed: Math.floor(Math.random() * 60),
      direction: Math.floor(Math.random() * 360),
      status: 'active',
      capacity: 40,
      occupancy: Math.floor(Math.random() * 40),
      currentStop: `Stop ${Math.floor(Math.random() * 10) + 1}`,
      nextStop: `Stop ${Math.floor(Math.random() * 10) + 1}`,
      estimatedTimeToNextStop: Math.floor(Math.random() * 10),
      lastUpdate: new Date().toISOString(),
      onTime: Math.random() > 0.2,
      driver: {
        name: `Driver ${i}`,
        phone: '923456789',
        photo: 'https://randomuser.me/api/portraits/men/1.jpg'
      }
    });
  }
  return buses;
};

// This function is still needed for Schedule.tsx which hasn't been updated yet
export const generateMockStops = (): StopData[] => {
  return [
    {
      id: '1',
      name: 'Escola Municipal',
      address: 'Rua da Escola, 123',
      latitude: -8.8368,
      longitude: 13.2343,
      scheduledTime: '07:30',
      estimatedTime: '07:30',
      busId: '1'
    },
    {
      id: '2',
      name: 'Centro Comercial',
      address: 'Avenida Central, 456',
      latitude: -8.8389,
      longitude: 13.2372,
      scheduledTime: '07:45',
      estimatedTime: '07:52',
      busId: '1'
    },
    {
      id: '3',
      name: 'Bairro Residencial',
      address: 'Rua das Flores, 789',
      latitude: -8.8410,
      longitude: 13.2401,
      scheduledTime: '08:00',
      estimatedTime: '08:10',
      busId: '1'
    }
  ];
};

// This function is also still needed for Schedule.tsx
export const generateMockRoutes = (): RouteData[] => {
  const stops = generateMockStops();
  return [
    {
      id: '1',
      name: 'Rota Escolar 01',
      description: 'Rota matinal para escola',
      stops: stops,
      buses: ['1'],
      schedule: {
        weekdays: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'],
        startTime: '07:00',
        endTime: '08:30'
      }
    }
  ];
};
