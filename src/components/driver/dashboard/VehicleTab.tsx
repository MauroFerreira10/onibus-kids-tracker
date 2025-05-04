
import React from 'react';
import { VehicleData } from '@/types';
import VehicleInfo from './VehicleInfo';
import NoVehicle from './NoVehicle';

interface VehicleTabProps {
  vehicle: VehicleData | null;
  loading: boolean;
  onRegisterVehicle: () => void;
}

const VehicleTab: React.FC<VehicleTabProps> = ({ 
  vehicle, 
  loading, 
  onRegisterVehicle 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-busapp-primary"></div>
      </div>
    );
  }
  
  if (vehicle) {
    return (
      <div className="space-y-4">
        <VehicleInfo vehicle={vehicle} onUpdateVehicle={onRegisterVehicle} />
      </div>
    );
  }
  
  return <NoVehicle onRegisterClick={onRegisterVehicle} />;
};

export default VehicleTab;
