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
import { formatCurrency } from "@/shared/utils/formatters";
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
            <div className="">
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
                <QuotasSummary quotaData={quotaData || []} />
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