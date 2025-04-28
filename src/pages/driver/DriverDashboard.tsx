
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import MapView from '@/components/MapView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bus, Calendar, CheckCircle, Clock, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBusData } from '@/hooks/useBusData';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

// Mock dados de alunos para embarcar
const mockStudents = [
  { id: '1', name: 'Ana Silva', grade: '5º Ano', pickup: 'Av. Principal, 123', status: 'waiting' },
  { id: '2', name: 'Bruno Oliveira', grade: '7º Ano', pickup: 'Rua das Flores, 45', status: 'waiting' },
  { id: '3', name: 'Carla Santos', grade: '3º Ano', pickup: 'Praça Central, 78', status: 'waiting' },
  { id: '4', name: 'Daniel Costa', grade: '8º Ano', pickup: 'Rua do Comércio, 12', status: 'waiting' },
  { id: '5', name: 'Eduarda Lima', grade: '4º Ano', pickup: 'Av. Central, 250', status: 'waiting' }
];

// Status para a viagem
type TripStatus = 'idle' | 'in_progress' | 'completed';

const DriverDashboard = () => {
  const { buses, isLoading } = useBusData();
  const [selectedBusId, setSelectedBusId] = useState<string | undefined>(buses.length > 0 ? buses[0].id : undefined);
  const [students, setStudents] = useState(mockStudents);
  const [tripStatus, setTripStatus] = useState<TripStatus>('idle');
  const [showEndDialog, setShowEndDialog] = useState(false);
  
  const selectedBus = selectedBusId ? buses.find(bus => bus.id === selectedBusId) : null;
  
  const startTrip = () => {
    setTripStatus('in_progress');
    toast.success('Viagem iniciada com sucesso!');
  };
  
  const endTrip = () => {
    setTripStatus('completed');
    setShowEndDialog(false);
    toast.success('Viagem finalizada com sucesso!');
    
    // Resetar após alguns segundos
    setTimeout(() => {
      setTripStatus('idle');
      setStudents(mockStudents);
    }, 5000);
  };
  
  const markStudentAsBoarded = (studentId: string) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, status: 'boarded' } : student
    ));
    toast.success('Aluno marcado como embarcado!');
  };
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header status */}
        <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center justify-between">
          <div className="flex items-center">
            <div className={`
              p-2 rounded-full mr-3
              ${tripStatus === 'idle' ? 'bg-gray-100 text-gray-600' : ''}
              ${tripStatus === 'in_progress' ? 'bg-green-100 text-green-700' : ''}
              ${tripStatus === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
            `}>
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-medium text-lg">Painel do Motorista</h2>
              <p className="text-sm text-gray-500">
                Status: {' '}
                <span className={`font-medium 
                  ${tripStatus === 'idle' ? 'text-gray-600' : ''}
                  ${tripStatus === 'in_progress' ? 'text-green-700' : ''}
                  ${tripStatus === 'completed' ? 'text-blue-700' : ''}
                `}>
                  {tripStatus === 'idle' ? 'Aguardando início' : 
                   tripStatus === 'in_progress' ? 'Viagem em andamento' : 
                   'Viagem finalizada'}
                </span>
              </p>
            </div>
          </div>
          
          <div>
            {tripStatus === 'idle' && (
              <Button 
                onClick={startTrip}
                className="bg-green-600 hover:bg-green-700"
              >
                <Bus className="mr-2 h-4 w-4" />
                Iniciar Viagem
              </Button>
            )}
            
            {tripStatus === 'in_progress' && (
              <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Encerrar Viagem
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar finalização</DialogTitle>
                  </DialogHeader>
                  <p className="py-4">
                    Tem certeza que deseja finalizar esta viagem? Esta ação não pode ser desfeita.
                  </p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEndDialog(false)}>
                      Cancelar
                    </Button>
                    <Button variant="default" onClick={endTrip}>
                      Confirmar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            {tripStatus === 'completed' && (
              <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Viagem Concluída
              </Badge>
            )}
          </div>
        </div>
        
        {/* Driver info and bus info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <User className="mr-2 h-5 w-5 text-busapp-primary" />
                Informações do Motorista
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">João Motorista</h3>
                  <p className="text-sm text-gray-500">ID: #12345</p>
                  <p className="text-sm text-gray-500">Contato: (99) 9999-9999</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-dashed">
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Em serviço hoje: 07:00 - 18:00</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Bus className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Ônibus designado: Escolar #001</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Bus className="mr-2 h-5 w-5 text-busapp-primary" />
                Informações da Rota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Rota:</span>
                  <span>Escola Municipal → Centro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Pontos de parada:</span>
                  <span>12 paradas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Próximo ponto:</span>
                  <span className="text-busapp-primary flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Av. Principal, 123
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Previsão:</span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    3 minutos
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Students list */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-busapp-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.90625 20.2491C3.82775 18.6531 5.1537 17.3278 6.75 16.4064C8.3463 15.485 10.1547 15 12 15C13.8453 15 15.6537 15.4851 17.25 16.4065C18.8463 17.3279 20.1722 18.6533 21.0938 20.2493" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Alunos para embarque
              </div>
              <Badge variant="outline" className="bg-busapp-secondary/20">
                {students.filter(s => s.status === 'waiting').length} alunos aguardando
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.map(student => (
                <div 
                  key={student.id} 
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${student.status === 'waiting' ? 'bg-white' : 'bg-gray-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-busapp-secondary/20 flex items-center justify-center text-busapp-secondary">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.90625 20.2491C3.82775 18.6531 5.1537 17.3278 6.75 16.4064C8.3463 15.485 10.1547 15 12 15C13.8453 15 15.6537 15.4851 17.25 16.4065C18.8463 17.3279 20.1722 18.6533 21.0938 20.2493" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-3">{student.grade}</span>
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{student.pickup}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {student.status === 'waiting' ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => markStudentAsBoarded(student.id)}
                        disabled={tripStatus !== 'in_progress'}
                      >
                        Marcar como embarcado
                      </Button>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Embarcado
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {students.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  Nenhum aluno para embarque
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Map view */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-busapp-primary" />
            Mapa da Rota
          </h3>
          <div className="h-[400px] rounded-lg overflow-hidden border">
            <MapView 
              buses={buses} 
              selectedBusId={selectedBusId} 
              onSelectBus={setSelectedBusId} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DriverDashboard;
