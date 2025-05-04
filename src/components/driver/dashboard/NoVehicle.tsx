
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bus } from 'lucide-react';

interface NoVehicleProps {
  onRegisterClick: () => void;
}

const NoVehicle: React.FC<NoVehicleProps> = ({ onRegisterClick }) => {
  return (
    <Card className="border shadow-sm text-center p-8">
      <div className="mb-6">
        <div className="rounded-full bg-busapp-primary/10 p-3 inline-block mb-4">
          <Bus className="h-8 w-8 text-busapp-primary" />
        </div>
        <h3 className="text-xl font-medium">Nenhum Veículo Registrado</h3>
        <p className="text-gray-500 mt-2">
          Você precisa registrar um veículo para poder iniciar viagens.
        </p>
      </div>
      <Button onClick={onRegisterClick}>
        Registrar Veículo
      </Button>
    </Card>
  );
};

export default NoVehicle;
