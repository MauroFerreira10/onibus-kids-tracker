import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentWithStatus } from '@/types/student';

interface StudentsListProps {
  students: StudentWithStatus[];
  loadingStudents: boolean;
  tripStatus: 'idle' | 'in_progress' | 'completed';
  onMarkAsBoarded: (studentId: string) => void;
  onMarkAsDisembarked?: (studentId: string) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({
  students,
  loadingStudents,
  tripStatus,
  onMarkAsBoarded,
  onMarkAsDisembarked,
}) => {
  const [showBoarded, setShowBoarded] = useState(false);

  const waitingStudents = students.filter(s => s.status === 'waiting');
  const presentAtStopStudents = students.filter(s => s.status === 'present_at_stop');
  const boardedStudents = students.filter(s => s.status === 'boarded');
  const disembarkedStudents = students.filter(s => s.status === 'disembarked');
  const absentStudents = students.filter(s => s.status === 'absent');

  const pendingStudents = [...presentAtStopStudents, ...waitingStudents, ...absentStudents];

  const handleBoarded = async (studentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tripStatus !== 'in_progress') {
      alert('Por favor, inicie a viagem antes de marcar alunos como embarcados.');
      return;
    }
    await onMarkAsBoarded(studentId);
  };

  const handleDisembarked = async (studentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tripStatus !== 'in_progress') {
      alert('A viagem precisa estar em progresso para registar desembarque.');
      return;
    }
    if (onMarkAsDisembarked) await onMarkAsDisembarked(studentId);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2 text-safebus-blue" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.90625 20.2491C3.82775 18.6531 5.1537 17.3278 6.75 16.4064C8.3463 15.485 10.1547 15 12 15C13.8453 15 15.6537 15.4851 17.25 16.4065C18.8463 17.3279 20.1722 18.6533 21.0938 20.2493" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Alunos
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {presentAtStopStudents.length > 0 && (
              <Badge variant="outline" className="bg-green-100 text-green-700">
                {presentAtStopStudents.length} no ponto
              </Badge>
            )}
            {waitingStudents.length > 0 && (
              <Badge variant="outline" className="bg-safebus-yellow/20">
                {waitingStudents.length} aguardando
              </Badge>
            )}
            {boardedStudents.length > 0 && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                {boardedStudents.length} embarcados
              </Badge>
            )}
            {disembarkedStudents.length > 0 && (
              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                {disembarkedStudents.length} desembarcados
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingStudents ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safebus-blue"></div>
          </div>
        ) : (
          <>
            {tripStatus !== 'in_progress' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Inicie a viagem para marcar presenças e desembarques.
                </p>
              </div>
            )}

            {/* Alunos pendentes (aguardando / presentes no ponto / ausentes) */}
            <div className="space-y-3 overflow-y-auto max-h-72">
              {pendingStudents.length > 0 ? (
                pendingStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="text-lg font-medium text-gray-600">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-3">{student.grade || 'N/A'}</span>
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{student.pickupAddress || 'Sem endereço'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {student.status === 'waiting' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleBoarded(student.id, e)}
                          disabled={tripStatus !== 'in_progress'}
                          className={tripStatus !== 'in_progress' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}
                        >
                          Embarcar
                        </Button>
                      )}
                      {student.status === 'present_at_stop' && (
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            No ponto
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleBoarded(student.id, e)}
                            disabled={tripStatus !== 'in_progress'}
                            className={`text-xs ${tripStatus !== 'in_progress' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
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
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhum aluno pendente.
                </div>
              )}
            </div>

            {/* Secção de embarcados com botão de desembarque */}
            {boardedStudents.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <button
                  className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 mb-2"
                  onClick={() => setShowBoarded(v => !v)}
                >
                  {showBoarded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {boardedStudents.length} aluno(s) embarcado(s)
                </button>
                {showBoarded && (
                  <div className="space-y-2">
                    {boardedStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                            <span className="text-base font-medium text-blue-700">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-blue-900">{student.name}</h3>
                            <p className="text-xs text-blue-600">{student.grade || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Embarcado
                          </Badge>
                          {onMarkAsDisembarked && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleDisembarked(student.id, e)}
                              disabled={tripStatus !== 'in_progress'}
                              className={`text-xs text-purple-700 border-purple-300 ${tripStatus !== 'in_progress' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}`}
                            >
                              <LogOut className="h-3 w-3 mr-1" />
                              Desembarcar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Desembarcados */}
            {disembarkedStudents.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-gray-500 font-medium mb-2">Desembarcados ({disembarkedStudents.length})</p>
                <div className="flex flex-wrap gap-2">
                  {disembarkedStudents.map(student => (
                    <Badge key={student.id} variant="outline" className="bg-purple-50 text-purple-700">
                      {student.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsList;
