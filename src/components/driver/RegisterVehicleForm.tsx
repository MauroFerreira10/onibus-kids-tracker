
import React, { useState, useEffect } from 'react';
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
  const [trackingEnabled, setTrackingEnabled] = useState(existingVehicle?.trackingEnabled || true);
  
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
      
      const vehicleData: Partial<VehicleData> = {
        licensePlate,
        model,
        capacity,
        year,
        driverId: user.id,
        status,
        trackingEnabled,
      };
      
      // Persistir no Supabase
      let response;
      
      if (existingVehicle?.id) {
        response = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', existingVehicle.id)
          .select();
      } else {
        response = await supabase
          .from('vehicles')
          .insert(vehicleData)
          .select();
      }
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const savedVehicle = response.data[0] as VehicleData;
      
      toast.success(`Veículo ${existingVehicle ? 'atualizado' : 'registrado'} com sucesso!`);
      
      if (onVehicleRegistered) {
        onVehicleRegistered(savedVehicle);
      }
    } catch (error) {
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
