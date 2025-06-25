import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";
import { DashboardStats } from "../components/DashboardMetrics";
import { QuotaData } from "../components/QuotasSummary";

export interface ClientStatusData {
  status_id: number;
  status_name: string;
  client_count: number;
}

export function useDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );

  // Query para obtener años disponibles
  const { data: availableYears, isLoading: yearsLoading } = useQuery({
    queryKey: ["available-years"],
    queryFn: async (): Promise<string[]> => {
      const response = await api.get("/api/charts/quotas/available-years");
      return response.data;
    },
  });

  // Query para obtener estadísticas básicas del dashboard
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["dashboard-stats", selectedPeriod],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await api.get("/api/charts/dashboard-stats");
      return response.data;
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  // Query para obtener datos del gráfico de estado de clientes
  const {
    data: clientStatusData,
    isLoading: clientStatusLoading,
    error: clientStatusError,
    refetch: refetchClientStatus,
  } = useQuery({
    queryKey: ["client-status-count"],
    queryFn: async (): Promise<ClientStatusData[]> => {
      const response = await api.get("/api/charts/clients/status-count");
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Query para obtener datos del gráfico de cuotas mensuales con año seleccionado
  const {
    data: quotaData,
    isLoading: quotaLoading,
    error: quotaError,
    refetch: refetchQuota,
  } = useQuery({
    queryKey: ["quota-monthly-summary", selectedYear],
    queryFn: async (): Promise<QuotaData[]> => {
      const response = await api.get(
        `/api/charts/quotas/monthly-summary?year=${selectedYear}`,
      );
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Estados derivados
  const isLoading = statsLoading || clientStatusLoading || quotaLoading || yearsLoading;
  const error = statsError || clientStatusError || quotaError;

  // Funciones
  const refetch = () => {
    refetchStats();
    refetchClientStatus();
    refetchQuota();
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  return {
    // Estado
    selectedPeriod,
    setSelectedPeriod,
    selectedYear,
    setSelectedYear,
    
    // Datos
    stats,
    clientStatusData,
    quotaData,
    availableYears,
    
    // Estados de carga
    isLoading,
    statsLoading,
    clientStatusLoading,
    quotaLoading,
    yearsLoading,
    
    // Errores
    error,
    statsError,
    clientStatusError,
    quotaError,
    
    // Funciones
    refetch,
    refetchStats,
    refetchClientStatus,
    refetchQuota,
    handleYearChange,
  };
} 