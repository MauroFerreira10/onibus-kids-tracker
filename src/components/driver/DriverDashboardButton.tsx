
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Bus } from 'lucide-react';

const DriverDashboardButton: React.FC = () => {
  const navigate = useNavigate();
  
  const handleNavigateToDriverDashboard = () => {
    navigate('/driver/dashboard');
  };
  
  return (
    <div className="fixed bottom-8 right-8">
      <Button
        onClick={handleNavigateToDriverDashboard}
        size="lg"
        className="rounded-full shadow-lg bg-busapp-primary hover:bg-busapp-primary/90"
      >
        <Bus className="mr-2 h-5 w-5" />
        Painel do Motorista
      </Button>
    </div>
  );
};

export default DriverDashboardButton;
