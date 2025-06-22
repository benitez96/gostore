import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Divider } from "@heroui/divider";
import { Progress } from "@heroui/progress";
import { Button } from "@heroui/button";
import DefaultLayout from "@/layouts/default";
import DashboardCharts from "@/components/DashboardCharts";
import { 
  RiDonutChartLine,
  RiUserLine,
  RiShoppingBagLine,
  RiMoneyDollarCircleLine,
  RiRidingLine,
  RiCalendarLine,
  RiBarChartLine,
  RiPieChartLine,
  RiInformationLine,
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiRefreshLine,
  RiArrowUpLine,
  RiArrowDownLine
} from "react-icons/ri";
import { api } from "../api";

interface DashboardStats {
  totalClients: number;
  totalProducts: number;
  totalSales: number;
  activeSales: number;
  totalRevenue: number;
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

  // Query para obtener estadísticas básicas del dashboard
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["dashboard-stats", selectedPeriod],
    queryFn: async () => {
      const response = await api.get("/api/charts/dashboard-stats");
      return response.data;
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  // Query para obtener datos del gráfico de estado de clientes
  const { data: clientStatusData, isLoading: clientStatusLoading, error: clientStatusError, refetch: refetchClientStatus } = useQuery({
    queryKey: ["client-status-count"],
    queryFn: async (): Promise<ClientStatusData[]> => {
      const response = await api.get("/api/charts/clients/status-count");
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Query para obtener datos del gráfico de cuotas mensuales
  const { data: quotaData, isLoading: quotaLoading, error: quotaError, refetch: refetchQuota } = useQuery({
    queryKey: ["quota-monthly-summary"],
    queryFn: async (): Promise<QuotaData[]> => {
      const response = await api.get("/api/charts/quotas/monthly-summary");
      return response.data;
    },
    refetchInterval: 30000,
  });

  const isLoading = statsLoading || clientStatusLoading || quotaLoading;
  const error = statsError || clientStatusError || quotaError;

  const refetch = () => {
    refetchStats();
    refetchClientStatus();
    refetchQuota();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'ok': return 'success';
      case 'warning': return 'warning';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'ok': return 'Al día';
      case 'warning': return 'Advertencia';
      case 'suspended': return 'Suspendido';
      default: return statusName;
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
            color="primary"
            variant="flat"
            startContent={<RiRefreshLine />}
            onPress={() => refetch()}
            className="font-medium"
          >
            Actualizar
          </Button>
        </div>

        <div className="max-w-7xl w-full px-4">
          {/* Métricas principales con animaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 font-medium">Total Clientes</p>
                    <p className="text-3xl font-bold text-primary mt-1">{stats?.totalClients || 0}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <RiUserLine className="text-primary text-sm" />
                      <span className="text-xs text-default-500">Registrados</span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <RiUserLine className="text-primary text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 font-medium">Total Productos</p>
                    <p className="text-3xl font-bold text-success mt-1">{stats?.totalProducts || 0}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <RiShoppingBagLine className="text-success text-sm" />
                      <span className="text-xs text-default-500">En catálogo</span>
                    </div>
                  </div>
                  <div className="p-3 bg-success/10 rounded-full">
                    <RiShoppingBagLine className="text-success text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 font-medium">Total Ventas</p>
                    <p className="text-3xl font-bold text-warning mt-1">{stats?.totalSales || 0}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <RiBarChartLine className="text-warning text-sm" />
                      <span className="text-xs text-default-500">
                        {stats?.activeSales || 0} activas
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-full">
                    <RiBarChartLine className="text-warning text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 font-medium">Ingresos Totales</p>
                    <p className="text-3xl font-bold text-secondary mt-1">{formatCurrency(stats?.totalRevenue || 0)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <RiMoneyDollarCircleLine className="text-secondary text-sm" />
                      <span className="text-xs text-default-500">Acumulados</span>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <RiMoneyDollarCircleLine className="text-secondary text-2xl" />
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
                clientStatusData={clientStatusData}
                quotaData={quotaData}
              />
            </div>
          )}

          {/* Accordion con estadísticas detalladas */}
          <Accordion variant="splitted" className="gap-4">
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
                  {clientStatusData && clientStatusData.map((status: ClientStatusData) => (
                    <Card key={status.status_id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-default-600">{getStatusText(status.status_name)}</p>
                            <p className="text-2xl font-bold">{status.client_count}</p>
                          </div>
                          <Chip 
                            color={getStatusColor(status.status_name) as any}
                            variant="flat"
                            size="sm"
                          >
                            {getStatusText(status.status_name)}
                          </Chip>
                        </div>
                        <Progress 
                          value={(status.client_count / (stats?.totalClients || 1)) * 100} 
                          color={getStatusColor(status.status_name) as any}
                          className="mt-2"
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
                  <span>Resumen Mensual de Cuotas</span>
                </div>
              }
            >
              <div className="p-4">
                {quotaData && quotaData.length > 0 ? (
                  <div className="space-y-4">
                    {quotaData.map((month: QuotaData, index: number) => (
                      <Card key={index} className="border border-default-200 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <h4 className="font-medium">{formatDate(month.month + '-01')}</h4>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-default-600">Monto Total</p>
                              <p className="text-xl font-bold">{formatCurrency(month.total_amount)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-default-600">Pagado</p>
                              <p className="text-xl font-bold text-success">{formatCurrency(month.amount_paid)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-default-600">Pendiente</p>
                              <p className="text-xl font-bold text-warning">{formatCurrency(month.amount_not_paid)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-default-600">Porcentaje Pagado</p>
                              <p className="text-xl font-bold">
                                {((month.amount_paid / (month.total_amount || 1)) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          <Divider className="my-4" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-default-600 mb-2">Progreso de pagos</p>
                              <Progress 
                                value={(month.amount_paid / (month.total_amount || 1)) * 100} 
                                color="success"
                                className="mb-2"
                              />
                              <div className="flex justify-between text-sm">
                                <span>Pagado: {formatCurrency(month.amount_paid)}</span>
                                <span>Pendiente: {formatCurrency(month.amount_not_paid)}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-sm text-default-600">Estado del mes</p>
                                <Chip 
                                  color={month.amount_not_paid === 0 ? "success" : month.amount_paid === 0 ? "danger" : "warning"}
                                  variant="flat"
                                  size="sm"
                                >
                                  {month.amount_not_paid === 0 ? "Completado" : month.amount_paid === 0 ? "Pendiente" : "Parcial"}
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
                    <p className="text-default-500">No hay datos de cuotas disponibles</p>
                  </div>
                )}
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </DefaultLayout>
  );
} 