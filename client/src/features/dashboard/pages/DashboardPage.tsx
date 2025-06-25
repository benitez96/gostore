import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import {
  RiDonutChartLine,
  RiRefreshLine,
  RiAlertLine,
  RiBarChartLine,
  RiFileListLine,
  RiUserLine,
  RiShoppingBagLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiPieChartLine,
  RiCheckLine,
} from "react-icons/ri";

import { LoadingSpinner } from "@/shared/components/feedback";
import DashboardCharts from "@/components/DashboardCharts";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { getStatusColor, getStatusText } from "@/shared/utils/constants";

import { DashboardMetrics, QuotasSummary, ReportsSection } from "../components";
import { useDashboard, ClientStatusData } from "../hooks";

interface QuotaData {
  month: string;
  total_amount: number;
  amount_paid: number;
  amount_not_paid: number;
}

export default function DashboardPage() {
  const {
    stats,
    clientStatusData,
    quotaData,
    availableYears,
    isLoading,
    error,
    selectedYear,
    refetch,
    handleYearChange,
  } = useDashboard();

  // Loading state
  if (isLoading) {
    return (
      <DefaultLayout>
        <LoadingSpinner fullPage label="Cargando dashboard..." />
      </DefaultLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <RiAlertLine className="text-4xl text-danger mb-4" />
          <p className="text-danger mb-4">Error al cargar el dashboard</p>
          <Button
            color="primary"
            startContent={<RiRefreshLine />}
            onPress={refetch}
          >
            Reintentar
          </Button>
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
            onPress={refetch}
          >
            Actualizar
          </Button>
        </div>

        <div className="max-w-7xl w-full px-4 flex flex-col gap-6">
          {/* Métricas principales */}
          {stats && <DashboardMetrics stats={stats} />}

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
                availableYears={availableYears || []}
                clientStatusData={clientStatusData || []}
                quotaData={quotaData || []}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
              />
            </div>
          )}

          {/* Gráficos y análisis avanzado */}
          <Accordion
            variant="splitted"
            defaultExpandedKeys={["client-status"]}
            className="px-0"
          >
            {/* Análisis de estado de clientes */}
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

            {/* Resumen de cuotas por mes */}
            <AccordionItem
              key="quotas"
              aria-label="Resumen de Cuotas"
              title={
                <div className="flex items-center gap-2">
                  <RiDonutChartLine className="text-warning" />
                  <span>Resumen de Cuotas por Mes</span>
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
              <ReportsSection />
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </DefaultLayout>
  );
} 