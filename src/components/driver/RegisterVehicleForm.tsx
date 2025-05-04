
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VehicleData } from '@/types';

interface RegisterVehicleFormProps {
  onVehicleRegistered?: (vehicle: VehicleData) => void;
  existingVehicle?: VehicleData | null;
}

const RegisterVehicleForm: React.FC<RegisterVehicleFormProps> = ({ 
  onVehicleRegistered,
  existingVehicle = null
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [licensePlate, setLicensePlate] = useState(existingVehicle?.licensePlate || '');
  const [model, setModel] = useState(existingVehicle?.model || '');
  const [capacity, setCapacity] = useState(existingVehicle?.capacity || 40);
  const [year, setYear] = useState(existingVehicle?.year || new Date().getFullYear().toString());
  const [status, setStatus] = useState<VehicleData['status']>(existingVehicle?.status || 'active');
  const [trackingEnabled, setTrackingEnabled] = useState(existingVehicle?.trackingEnabled ?? true);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para registrar um veículo');
      return;
    }
    
    if (!licensePlate || !model || !capacity || !year) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Usar inserção direta no banco de dados em vez de RPC por enquanto
      let result;
      
      if (existingVehicle) {
        // Update existing vehicle
        result = await supabase
          .from('vehicles')
          .update({
            license_plate: licensePlate,
            model: model,
            capacity: capacity,
            year: year,
            status: status,
            tracking_enabled: trackingEnabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVehicle.id)
          .select()
          .single();
      } else {
        // Register new vehicle
        result = await supabase
          .from('vehicles')
          .insert({
            license_plate: licensePlate,
            model: model,
            capacity: capacity,
            year: year,
            driver_id: user.id,
            status: status,
            tracking_enabled: trackingEnabled
          })
          .select()
          .single();
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Map the database response to our VehicleData interface
      const data = result.data;
      const savedVehicle: VehicleData = {
        id: data.id,
        licensePlate: data.license_plate,
        model: data.model,
        capacity: data.capacity,
        year: data.year,
        driverId: data.driver_id,
        status: data.status,
        trackingEnabled: data.tracking_enabled,
        lastLatitude: data.last_latitude,
        lastLongitude: data.last_longitude,
        lastLocationUpdate: data.last_location_update
      };
      
      const actionText = existingVehicle ? 'atualizado' : 'registrado';
      toast.success(`Veículo ${actionText} com sucesso!`);
      
      if (trackingEnabled) {
        toast.info(`O rastreamento do veículo está ativado. Entre na aba "Localização" para iniciar o rastreamento.`, {
          duration: 7000
        });
      }
      
      if (onVehicleRegistered) {
        onVehicleRegistered(savedVehicle);
      }
    } catch (error: any) {
      console.error('Erro ao registrar veículo:', error);
      toast.error(`Erro ao ${existingVehicle ? 'atualizar' : 'registrar'} o veículo. Tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const yearOptions = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{existingVehicle ? 'Atualizar Veículo' : 'Registrar Novo Veículo'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Placa do Veículo *</Label>
              <Input
                id="licensePlate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="Ex: ABC-1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: Mercedes-Benz Escolar"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (Alunos) *</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                placeholder="Ex: 40"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Ano *</Label>
              <Select
                value={year}
                onValueChange={setYear}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((yearOption) => (
                    <SelectItem key={yearOption} value={yearOption}>
                      {yearOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status do Veículo</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as VehicleData['status'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="maintenance">Em Manutenção</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-6">
              <Label htmlFor="trackingEnabled" className="cursor-pointer">
                Permitir rastreamento de localização
              </Label>
              <Switch
                id="trackingEnabled"
                checked={trackingEnabled}
                onCheckedChange={setTrackingEnabled}
              />
            </div>
          </div>
          
          {/* Mensagem informativa sobre o rastreamento */}
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-blue-800 text-sm">
              <strong>Rastreamento de localização:</strong> Quando ativado, permite que pais, alunos e gestores acompanhem o ônibus em tempo real durante as viagens.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Salvando...' : existingVehicle ? 'Atualizar Veículo' : 'Registrar Veículo'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterVehicleForm;
