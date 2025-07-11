import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateValue } from "@heroui/calendar";
import { today, CalendarDate } from "@internationalized/date";

import { api } from "@/api";

export interface DailyCollectionData {
  collection_date: string; // Format: "2024-01-15"
  total_collected: number;
  payment_count: number;
}

export function useDailyCollections() {
  // Estado para el rango de fechas (últimos 30 días por defecto)
  // Usar zona horaria específica de Argentina para consistencia
  const todayDate = today("America/Argentina/Buenos_Aires");
  const thirtyDaysAgo = todayDate.subtract({ days: 30 });
  
  const [startDate, setStartDate] = useState<DateValue>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<DateValue>(todayDate);

  // Convertir DateValue a string formato YYYY-MM-DD
  const formatDateForAPI = (date: DateValue): string => {
    const year = date.year;
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startDateStr = formatDateForAPI(startDate);
  const endDateStr = formatDateForAPI(endDate);

  // Query para obtener los datos de cobros diarios
  const {
    data: dailyCollections,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["daily-collections", startDateStr, endDateStr],
    queryFn: async (): Promise<DailyCollectionData[]> => {
      const response = await api.get(
        `/api/charts/collections/daily?start_date=${startDateStr}&end_date=${endDateStr}`
      );
      return response.data || [];
    },
    enabled: !!startDate && !!endDate, // Solo ejecutar si tenemos ambas fechas
  });

  // Funciones para actualizar las fechas
  const handleStartDateChange = (date: DateValue) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: DateValue) => {
    setEndDate(date);
  };

  const handleDateRangeChange = (start: DateValue, end: DateValue) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Funciones de conveniencia para rangos predefinidos
  const setLast7Days = () => {
    const todayDate = today("America/Argentina/Buenos_Aires");
    const sevenDaysAgo = todayDate.subtract({ days: 7 });
    
    setStartDate(sevenDaysAgo);
    setEndDate(todayDate);
  };

  const setLast30Days = () => {
    const todayDate = today("America/Argentina/Buenos_Aires");
    const thirtyDaysAgo = todayDate.subtract({ days: 30 });
    
    setStartDate(thirtyDaysAgo);
    setEndDate(todayDate);
  };

  const setCurrentMonth = () => {
    const todayDate = today("America/Argentina/Buenos_Aires");
    const firstDayOfMonth = new CalendarDate(todayDate.year, todayDate.month, 1);
    
    setStartDate(firstDayOfMonth);
    setEndDate(todayDate);
  };

  return {
    // Datos
    dailyCollections,
    
    // Estados de fecha
    startDate,
    endDate,
    startDateStr,
    endDateStr,
    
    // Estados de carga
    isLoading,
    error,
    
    // Funciones
    refetch,
    handleStartDateChange,
    handleEndDateChange,
    handleDateRangeChange,
    
    // Funciones de conveniencia
    setLast7Days,
    setLast30Days,
    setCurrentMonth,
  };
} 