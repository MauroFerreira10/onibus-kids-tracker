
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentWithStatus } from '@/types/student';

interface StudentsListProps {
  students: StudentWithStatus[];
  loadingStudents: boolean;
  tripStatus: 'idle' | 'in_progress' | 'completed';
  onMarkAsBoarded: (studentId: string) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({ 
  students, 
  loadingStudents, 
  tripStatus, 
  onMarkAsBoarded 
}) => {
  // Separar estudantes por status para destaque
  const waitingStudents = students.filter(s => s.status === 'waiting');
  const presentAtStopStudents = students.filter(s => s.status === 'present_at_stop');
  const boardedStudents = students.filter(s => s.status === 'boarded');
  const absentStudents = students.filter(s => s.status === 'absent');
  
  // Ordenar estudantes para exibição
  const sortedStudents = [
    ...presentAtStopStudents,
    ...waitingStudents,
    ...boardedStudents,
    ...absentStudents
  ];
  
  return (
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
          <div className="flex gap-2">
            {presentAtStopStudents.length > 0 && (
              <Badge variant="outline" className="bg-green-100 text-green-700">
                {presentAtStopStudents.length} presentes no ponto
              </Badge>
            )}
            <Badge variant="outline" className="bg-busapp-secondary/20">
              {waitingStudents.length} aguardando
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingStudents ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-busapp-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {students.length > 0 ? (
              sortedStudents.map(student => (
                <div 
                  key={student.id} 
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${student.status === 'waiting' ? 'bg-white' : 'bg-gray-50'}
                    ${student.status === 'present_at_stop' ? 'bg-green-50 border-green-200' : ''}
                    ${student.status === 'boarded' ? 'bg-blue-50 border-blue-200' : ''}
                    ${student.status === 'absent' ? 'bg-red-50 border-red-200' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      h-10 w-10 rounded-full flex items-center justify-center
                      ${student.status === 'present_at_stop' ? 'bg-green-100 text-green-600' : 'bg-busapp-secondary/20 text-busapp-secondary'}
                      ${student.status === 'boarded' ? 'bg-blue-100 text-blue-600' : ''}
                      ${student.status === 'absent' ? 'bg-red-100 text-red-600' : ''}
                    `}>
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.90625 20.2491C3.82775 18.6531 5.1537 17.3278 6.75 16.4064C8.3463 15.485 10.1547 15 12 15C13.8453 15 15.6537 15.4851 17.25 16.4065C18.8463 17.3279 20.1722 18.6533 21.0938 20.2493" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-3">{student.grade || 'N/A'}</span>
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{student.pickupAddress || 'Endereço não registrado'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {student.status === 'waiting' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onMarkAsBoarded(student.id)}
                        disabled={tripStatus !== 'in_progress'}
                      >
                        Marcar como embarcado
                      </Button>
                    )}
                    
                    {student.status === 'boarded' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Embarcado
                      </Badge>
                    )}
                    
                    {student.status === 'present_at_stop' && (
                      <div className="flex flex-col items-end">
                        <Badge variant="outline" className="bg-green-50 text-green-700 mb-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Presente no ponto
                        </Badge>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onMarkAsBoarded(student.id)}
                          disabled={tripStatus !== 'in_progress'}
                          className="text-xs"
                        >
                          Confirmar embarque
                        </Button>
                      </div>
                    )}
                    
                    {student.status === 'absent' && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        Ausente
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                Nenhum aluno registrado para esta rota.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsList;
