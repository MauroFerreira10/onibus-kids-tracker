import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { StopData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Bus, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fetchStopsWithStatus } from '@/services/scheduleService';
import { Badge } from '@/components/ui/badge';

const Schedule = () => {
  const [stops, setStops] = useState<StopData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStops();
  }, [selectedDate]);

  const fetchStops = async () => {
    try {
      setIsLoading(true);
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setStops([]);
        setIsLoading(false);
        return;
      }
      const stopsWithStatus = await fetchStopsWithStatus();
      setStops(stopsWithStatus);
      if (stopsWithStatus.length === 0) {
        toast({
          title: 'Nenhum horário encontrado',
          description: 'Verifique se existem paradas cadastradas no sistema.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um problema ao carregar os horários.',
        variant: 'destructive',
      });
      setStops([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        await supabase.rpc('cleanup_expired_attendance');
      } catch (error) {
        console.error('Erro ao limpar confirmações expiradas:', error);
      }
    }, 60000);
    return () => clearInterval(cleanupInterval);
  }, []);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const onTime = stops.filter((s) => s.scheduledTime === s.estimatedTime).length;
  const delayed = stops.length - onTime;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
        >
          {/* Hero Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-safebus-blue via-safebus-blue to-safebus-blue-dark rounded-2xl shadow-xl"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FBBF24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute top-0 right-0 w-64 h-64 bg-safebus-yellow/10 rounded-full -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-safebus-yellow rounded-2xl shadow-lg flex-shrink-0">
                  <Clock className="h-8 w-8 text-safebus-blue" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Horários do Transporte</h1>
                  <p className="text-safebus-yellow font-semibold text-sm mt-0.5">Acompanhe paradas em tempo real</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-white text-sm font-semibold">Atualização em tempo real</span>
              </div>
            </div>

            {/* Embedded stats */}
            <div className="relative z-10 grid grid-cols-3 border-t border-white/10">
              {[
                { icon: MapPin, label: 'Paradas', value: stops.length, color: 'text-safebus-yellow' },
                { icon: CheckCircle2, label: 'No horário', value: onTime, color: 'text-emerald-400' },
                { icon: Timer, label: 'Com atraso', value: delayed, color: 'text-orange-300' },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="px-5 py-4 border-r border-white/10 last:border-r-0 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-white/15 rounded-md">
                      <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                    </div>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wide">{s.label}</p>
                  </div>
                  {isLoading ? (
                    <div className="h-7 w-12 bg-white/20 animate-pulse rounded mt-1" />
                  ) : (
                    <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.header>

          {/* Date Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md border border-safebus-blue/10 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => changeDate(-1)}
                className="p-3 rounded-xl bg-safebus-blue/5 hover:bg-safebus-blue/10 transition-colors group"
                aria-label="Dia anterior"
              >
                <ChevronLeft className="w-5 h-5 text-safebus-blue group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-safebus-blue" />
                  <span className="text-lg font-bold capitalize text-safebus-blue">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {isToday && <Badge className="bg-safebus-yellow text-safebus-blue border-0 font-semibold">Hoje</Badge>}
                  {isWeekend && <Badge className="bg-red-500 text-white border-0">Fim de semana</Badge>}
                </div>
              </div>

              <button
                onClick={() => changeDate(1)}
                className="p-3 rounded-xl bg-safebus-blue/5 hover:bg-safebus-blue/10 transition-colors group"
                aria-label="Dia seguinte"
              >
                <ChevronRight className="w-5 h-5 text-safebus-blue group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Stops list */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md border border-safebus-blue/10 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-safebus-blue/3 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-safebus-blue">Paradas para {formatDate(selectedDate).split(',')[0]}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Horário previsto e estimado em tempo real</p>
                </div>
                {stops.length > 0 && (
                  <div className="flex items-center gap-2 bg-safebus-blue/5 px-3 py-1.5 rounded-full">
                    <Bus className="w-4 h-4 text-safebus-blue" />
                    <span className="text-sm font-semibold text-safebus-blue">
                      {stops.length} {stops.length === 1 ? 'parada' : 'paradas'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {isWeekend && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800 font-bold">Sem serviço</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Os autocarros não operam aos fins de semana. Selecione um dia útil.
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-full h-28 rounded-xl" />
                  ))}
                </div>
              ) : stops.length > 0 ? (
                <div className="space-y-3">
                  {stops.map((stop, index) => {
                    const onTimeStop = stop.scheduledTime === stop.estimatedTime;
                    return (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group rounded-xl border border-gray-100 hover:border-safebus-blue/30 bg-white hover:shadow-md transition-all overflow-hidden"
                      >
                        <div className="flex">
                          <div
                            className={cn(
                              'w-1.5 flex-shrink-0',
                              onTimeStop ? 'bg-emerald-500' : 'bg-orange-500'
                            )}
                          />
                          <div className="flex-1 p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-safebus-blue text-base">{stop.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center mt-1 truncate">
                                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                                  {stop.address}
                                </p>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                  <div className="bg-safebus-blue/5 rounded-lg p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-safebus-blue/60 font-bold mb-1">Previsto</p>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-safebus-blue" />
                                      <span className="font-bold text-safebus-blue">{stop.scheduledTime || '—'}</span>
                                    </div>
                                  </div>
                                  <div
                                    className={cn(
                                      'rounded-lg p-3',
                                      onTimeStop ? 'bg-emerald-50' : 'bg-orange-50'
                                    )}
                                  >
                                    <p
                                      className={cn(
                                        'text-[10px] uppercase tracking-widest font-bold mb-1',
                                        onTimeStop ? 'text-emerald-600/80' : 'text-orange-600/80'
                                      )}
                                    >
                                      Estimado
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Clock
                                        className={cn(
                                          'w-4 h-4',
                                          onTimeStop ? 'text-emerald-600' : 'text-orange-600'
                                        )}
                                      />
                                      <span
                                        className={cn(
                                          'font-bold',
                                          onTimeStop ? 'text-emerald-700' : 'text-orange-700'
                                        )}
                                      >
                                        {stop.estimatedTime || '—'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <Badge
                                className={cn(
                                  'border-0 font-semibold flex items-center gap-1.5 self-start',
                                  onTimeStop
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-orange-500 text-white'
                                )}
                              >
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                                {onTimeStop ? 'No horário' : 'Atrasado'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : !isWeekend ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-safebus-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bus className="w-8 h-8 text-safebus-blue/40" />
                  </div>
                  <p className="text-gray-400 font-medium">Nenhum horário disponível para esta data</p>
                </div>
              ) : null}
            </div>
          </motion.section>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Schedule;
