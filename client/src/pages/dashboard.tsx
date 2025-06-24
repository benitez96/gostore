import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Divider } from "@heroui/divider";
import { Progress } from "@heroui/progress";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import {
  RiDonutChartLine,
  RiUserLine,
  RiShoppingBagLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiBarChartLine,
  RiPieChartLine,
  RiAlertLine,
  RiCheckLine,
  RiRefreshLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFileListLine,
  RiEyeLine,
} from "react-icons/ri";

import { api, downloadSalesBook } from "../api";

import DefaultLayout from "@/layouts/default";
import DashboardCharts from "@/components/DashboardCharts";

interface DashboardStats {
  totalClients: number;
  totalProducts: number;
  totalSales: number;
  activeSales: number;
  totalRevenue: number;
  pendingAmount: number;
  collectedThisMonth: number;
  quotasDueThisMonth: number;
  collectedFromQuotasDueThisMonth: number;
  quotasDueNextMonth: number;
  paidQuotasDueThisMonth: number;
  countQuotasDueThisMonth: number;
  paidQuotasDueLastMonth: number;
  countQuotasDueLastMonth: number;
}

interface ClientStatusData {
  status_id: number;
  status_name: string;
  client_count: number;
}

interface QuotaData {
  month: string;
  total_amount: number;
  amount_paid: number;
  amount_not_paid: number;
}

export default function DashboardPage() {
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
    queryFn: async () => {
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

  const isLoading =
    statsLoading || clientStatusLoading || quotaLoading || yearsLoading;
  const error = statsError || clientStatusError || quotaError;

  const refetch = () => {
    refetchStats();
    refetchClientStatus();
    refetchQuota();
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // Si la fecha viene en formato YYYY-MM, agregar el día 01
    const fullDateString = dateString.includes("-01")
      ? dateString
      : dateString + "-01";

    // Crear la fecha usando UTC para evitar problemas de zona horaria
    const [year, month] = fullDateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);

    return date.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case "ok":
        return "success";
      case "warning":
        return "warning";
      case "suspended":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusText = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case "ok":
        return "Al día";
      case "warning":
        return "Advertencia";
      case "suspended":
        return "Suspendido";
      default:
        return statusName;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <RiArrowUpLine className="text-success" />;
    } else if (current < previous) {
      return <RiArrowDownLine className="text-danger" />;
    }

    return null;
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <RiAlertLine className="text-4xl text-danger mb-4" />
          <p className="text-danger">Error al cargar el dashboard</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6">
        {/* Header con título y botón de refresh */}
        <div className="flex items-center justify-between max-w-7xl w-full px-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <RiDonutChartLine className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-default-500">Vista general de tu negocio</p>
            </div>
          </div>
          <Button
            className="font-medium"
            color="primary"
            startContent={<RiRefreshLine />}
            variant="flat"
            onPress={() => refetch()}
          >
            Actualizar
          </Button>
        </div>

        <div className="max-w-7xl w-full px-4">
          {/* Métricas principales con diseño asimétrico */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            {/* Total Clientes - 1 columna, 1 fila */}
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-primary/10 rounded-full mb-2">
                    <RiUserLine className="text-primary text-xl" />
                  </div>
                  <p className="text-sm text-default-600 font-medium">
                    Total Clientes
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {stats?.totalClients || 0}
                  </p>
                  <span className="text-xs text-default-500">Registrados</span>
                </div>
              </CardBody>
            </Card>

            {/* Total Productos - 1 columna, 1 fila */}
            <Card className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-success/10 rounded-full mb-2">
                    <RiShoppingBagLine className="text-success text-xl" />
                  </div>
                  <p className="text-sm text-default-600 font-medium">
                    Total Productos
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {stats?.totalProducts || 0}
                  </p>
                  <span className="text-xs text-default-500">En catálogo</span>
                </div>
              </CardBody>
            </Card>

            {/* Total Ventas - 1 columna, 1 fila */}
            <Card className="bg-gradient-to-br lg:row-span-2 from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-4">
                <div className="flex flex-col items-center text-center h-full justify-between">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 bg-warning/10 rounded-full mb-2">
                      <RiBarChartLine className="text-warning text-xl" />
                    </div>
                    <p className="text-sm text-default-600 font-medium">
                      Total Ventas
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-warning">
                    {stats?.totalSales || 0}
                  </p>
                  <span className="text-xs text-default-500">
                    {stats?.activeSales || 0} activas
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Cobrado este mes - 2 columnas, 1 fila */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 font-medium">
                      Cobrado este mes
                    </p>
                    <p className="text-3xl font-bold text-success mt-1 text-balance">
                      {formatCurrency(stats?.collectedThisMonth || 0)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <RiMoneyDollarCircleLine className="text-success text-sm" />
                      <span className="text-xs text-default-500">
                        Pagos recibidos
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-success/10 rounded-full">
                    <RiMoneyDollarCircleLine className="text-success text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Card: Cuotas cobradas este mes */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-center">
              <CardBody className="p-4 flex flex-col items-center text-center">
                <div className="p-2 bg-success/10 rounded-full mb-2">
                  <RiCheckLine className="text-success text-2xl" />
                </div>
                <p className="text-sm text-default-600 font-medium">
                  Cuotas cobradas
                </p>
                <p className="text-2xl font-bold text-success">
                  {stats?.paidQuotasDueThisMonth || 0}
                  <span className="text-default-500">
                    {" "}
                    / {stats?.countQuotasDueThisMonth || 0}
                  </span>
                </p>
                <span className="text-xs text-default-500 mt-1">Este mes</span>
              </CardBody>
            </Card>

            {/* Pendiente por Cobrar - 2 columnas, 2 filas */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-lg text-default-600 font-medium">
                      Pendiente por Cobrar
                    </p>
                    <p className="text-3xl font-bold text-danger mt-2 text-balance">
                      {formatCurrency(stats?.pendingAmount || 0)}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <RiMoneyDollarCircleLine className="text-danger text-lg" />
                      <span className="text-sm text-default-500">
                        Cuotas vencidas
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-danger/10 rounded-full">
                    <RiMoneyDollarCircleLine className="text-danger text-3xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Card: Cuotas cobradas mes anterior */}
            <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-center">
              <CardBody className="p-4 flex flex-col items-center text-center">
                <div className="p-2 bg-info/10 rounded-full mb-2">
                  <RiCheckLine className="text-info text-2xl" />
                </div>
                <p className="text-sm text-default-600 font-medium">
                  Cuotas cobradas
                </p>
                <p className="text-2xl font-bold text-info">
                  {stats?.paidQuotasDueLastMonth || 0}
                  <span className="text-default-500">
                    {" "}
                    / {stats?.countQuotasDueLastMonth || 0}
                  </span>
                </p>
                <span className="text-xs text-default-500 mt-1">
                  Mes anterior
                </span>
              </CardBody>
            </Card>

            {/* Cobrado de cuotas que vencen este mes - 2 columnas, 1 fila */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 font-medium">
                      Cobrado de cuotas que vencen este mes
                    </p>
                    <p className="text-3xl font-bold text-secondary mt-1 text-balance">
                      {formatCurrency(
                        stats?.collectedFromQuotasDueThisMonth || 0,
                      )}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <RiCheckLine className="text-secondary text-sm" />
                      <span className="text-xs text-default-500">
                        Pagos sobre cuotas de este mes
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <RiCheckLine className="text-secondary text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Cuotas con vencimiento este mes - 2 columnas, 1 fila */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 font-medium">
                      Cuotas con vencimiento este mes
                    </p>
                    <p className="text-3xl font-bold text-primary mt-1 text-balance">
                      {formatCurrency(stats?.quotasDueThisMonth || 0)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <RiCalendarLine className="text-primary text-sm" />
                      <span className="text-xs text-default-500">
                        Total cuotas
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <RiCalendarLine className="text-primary text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
            {/* Cuotas con vencimiento próximo mes - 2 columnas, 1 fila */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-info-50 to-info-100 dark:from-info-900/20 dark:to-info-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 font-medium">
                      Cuotas con venc. próximo mes
                    </p>
                    <p className="text-3xl font-bold text-info mt-1 text-balance">
                      {formatCurrency(stats?.quotasDueNextMonth || 0)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <RiCalendarLine className="text-info text-sm" />
                      <span className="text-xs text-default-500">
                        Próximo mes
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-info/10 rounded-full">
                    <RiCalendarLine className="text-info text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Ingresos Totales - 2 columnas, 1 fila */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 font-medium">
                      Ingresos Totales
                    </p>
                    <p className="text-3xl font-bold text-warning mt-1 text-balance">
                      {formatCurrency(stats?.totalRevenue || 0)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <RiMoneyDollarCircleLine className="text-warning text-sm" />
                      <span className="text-xs text-default-500">
                        Acumulados
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-full">
                    <RiMoneyDollarCircleLine className="text-warning text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Gráficos principales */}
          {stats && clientStatusData && quotaData && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <RiPieChartLine className="text-primary text-xl" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Análisis Visual
                </h2>
              </div>
              <DashboardCharts
                availableYears={availableYears}
                clientStatusData={clientStatusData}
                quotaData={quotaData}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
              />
            </div>
          )}

          {/* Accordion con estadísticas detalladas */}
          <Accordion
            className="gap-4"
            itemClasses={{
              content: "px-0",
            }}
            variant="splitted"
          >
            {/* Estado de clientes */}
            <AccordionItem
              key="client-status"
              aria-label="Estado de clientes"
              title={
                <div className="flex items-center gap-2">
                  <RiUserLine className="text-primary" />
                  <span>Estado de Clientes</span>
                </div>
              }
            >
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {clientStatusData &&
                    clientStatusData.map((status: ClientStatusData) => (
                      <Card
                        key={status.status_id}
                        className="border-l-4 border-l-primary hover:shadow-md transition-shadow"
                      >
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-default-600">
                                {getStatusText(status.status_name)}
                              </p>
                              <p className="text-2xl font-bold">
                                {status.client_count}
                              </p>
                            </div>
                            <Chip
                              color={getStatusColor(status.status_name) as any}
                              size="sm"
                              variant="flat"
                            >
                              {getStatusText(status.status_name)}
                            </Chip>
                          </div>
                          <Progress
                            className="mt-2"
                            color={getStatusColor(status.status_name) as any}
                            value={
                              (status.client_count /
                                (stats?.totalClients || 1)) *
                              100
                            }
                          />
                        </CardBody>
                      </Card>
                    ))}
                </div>
              </div>
            </AccordionItem>

            {/* Resumen mensual de cuotas */}
            <AccordionItem
              key="monthly-quotas"
              aria-label="Resumen mensual de cuotas"
              title={
                <div className="flex items-center gap-2">
                  <RiCalendarLine className="text-success" />
                  <span>
                    Resumen Mensual de Cuotas{" "}
                    {selectedYear && `(${selectedYear})`}
                  </span>
                </div>
              }
            >
              <div className="p-4">
                {quotaData && quotaData.length > 0 ? (
                  <div className="space-y-4">
                    {quotaData.map((month: QuotaData, index: number) => (
                      <Card
                        key={index}
                        className="border border-default-200 hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-2">
                          <h4 className="font-medium">
                            {formatDate(month.month + "-01")}
                          </h4>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-default-600">
                                Monto Total
                              </p>
                              <p className="text-xl font-bold">
                                {formatCurrency(month.total_amount)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-default-600">Pagado</p>
                              <p className="text-xl font-bold text-success">
                                {formatCurrency(month.amount_paid)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-default-600">
                                Pendiente
                              </p>
                              <p className="text-xl font-bold text-warning">
                                {formatCurrency(month.amount_not_paid)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-default-600">
                                Porcentaje Pagado
                              </p>
                              <p className="text-xl font-bold">
                                {(
                                  (month.amount_paid /
                                    (month.total_amount || 1)) *
                                  100
                                ).toFixed(1)}
                                %
                              </p>
                            </div>
                          </div>

                          <Divider className="my-4" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-default-600 mb-2">
                                Progreso de pagos
                              </p>
                              <Progress
                                className="mb-2"
                                color="success"
                                value={
                                  (month.amount_paid /
                                    (month.total_amount || 1)) *
                                  100
                                }
                              />
                              <div className="flex justify-between text-sm">
                                <span>
                                  Pagado: {formatCurrency(month.amount_paid)}
                                </span>
                                <span>
                                  Pendiente:{" "}
                                  {formatCurrency(month.amount_not_paid)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-sm text-default-600">
                                  Estado del mes
                                </p>
                                <Chip
                                  color={
                                    month.amount_not_paid === 0
                                      ? "success"
                                      : month.amount_paid === 0
                                        ? "danger"
                                        : "warning"
                                  }
                                  size="sm"
                                  variant="flat"
                                >
                                  {month.amount_not_paid === 0
                                    ? "Completado"
                                    : month.amount_paid === 0
                                      ? "Pendiente"
                                      : "Parcial"}
                                </Chip>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RiCalendarLine className="text-4xl mx-auto mb-2 text-default-400" />
                    <p className="text-default-500">
                      No hay datos de cuotas disponibles
                    </p>
                  </div>
                )}
              </div>
            </AccordionItem>

            {/* Reportes */}
            <AccordionItem
              key="reports"
              aria-label="Reportes"
              title={
                <div className="flex items-center gap-2">
                  <RiFileListLine className="text-secondary" />
                  <span>Reportes</span>
                </div>
              }
            >
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Libro de Ventas */}
                  <Card className="border border-default-200 hover:shadow-md transition-shadow">
                    <CardBody className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <RiEyeLine className="text-secondary text-lg" />
                          <h4 className="font-medium">Libro de Ventas</h4>
                        </div>
                        <p className="text-sm text-default-600">
                          Genera un PDF con todas las fichas de ventas pendientes ordenadas alfabéticamente por cliente.
                        </p>
                        <Button
                          className="font-medium"
                          color="secondary"
                          startContent={<RiEyeLine />}
                          variant="flat"
                          onPress={async () => {
                            try {
                              await downloadSalesBook();
                              addToast({
                                title: "Libro generado",
                                description: "El libro de ventas pendientes se descargó correctamente.",
                                color: "success",
                              });
                            } catch (error) {
                              addToast({
                                title: "Error al generar libro",
                                description: "No se pudo descargar el libro de ventas. Inténtalo de nuevo.",
                                color: "danger",
                              });
                            }
                          }}
                        >
                          Descargar Libro
                        </Button>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Placeholder para futuros reportes */}
                  <Card className="border border-dashed border-default-300">
                    <CardBody className="p-4">
                      <div className="flex flex-col gap-3 items-center text-center">
                        <RiBarChartLine className="text-default-400 text-2xl" />
                        <h4 className="font-medium text-default-600">Reporte de Ventas</h4>
                        <p className="text-sm text-default-500">
                          Próximamente: Análisis detallado de ventas por período.
                        </p>
                        <Button
                          className="font-medium"
                          color="default"
                          variant="flat"
                          isDisabled
                        >
                          Próximamente
                        </Button>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="border border-dashed border-default-300">
                    <CardBody className="p-4">
                      <div className="flex flex-col gap-3 items-center text-center">
                        <RiPieChartLine className="text-default-400 text-2xl" />
                        <h4 className="font-medium text-default-600">Reporte Financiero</h4>
                        <p className="text-sm text-default-500">
                          Próximamente: Análisis de ingresos y pagos pendientes.
                        </p>
                        <Button
                          className="font-medium"
                          color="default"
                          variant="flat"
                          isDisabled
                        >
                          Próximamente
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </DefaultLayout>
  );
}
