import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button, ButtonGroup } from "@heroui/button";
import { DateRangePicker } from "@heroui/date-picker";
import { Spinner } from "@heroui/spinner";
import { RiCalendarLine, RiBarChartLine, RiRefreshLine } from "react-icons/ri";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useDailyCollections, DailyCollectionData } from "../hooks";
import { formatCurrency } from "@/shared/utils/formatters";

export function DailyCollectionsChart() {
  const {
    dailyCollections,
    startDate,
    endDate,
    isLoading,
    error,
    refetch,
    handleDateRangeChange,
    setLast7Days,
    setLast30Days,
    setCurrentMonth,
  } = useDailyCollections();

  // Preparar datos para el gráfico de barras
  const chartData = dailyCollections?.map((item: DailyCollectionData) => ({
    date: item.collection_date,
    displayDate: new Date(item.collection_date).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
    totalCollected: item.total_collected,
    paymentCount: item.payment_count,
  })) || [];

  // Componente de tooltip personalizado siguiendo el patrón del gráfico existente
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{data.displayDate}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#3b82f6" }}
              />
              <span className="text-sm">Cobrado:</span>
              <span className="font-medium">
                {formatCurrency(data.totalCollected)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#10b981" }}
              />
              <span className="text-sm">Pagos:</span>
              <span className="font-medium">{data.paymentCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calcular totales para mostrar en el header
  const totalCollected = dailyCollections?.reduce((sum, item) => sum + item.total_collected, 0) || 0;
  const totalPayments = dailyCollections?.reduce((sum, item) => sum + item.payment_count, 0) || 0;
  const averageDaily = dailyCollections?.length ? totalCollected / dailyCollections.length : 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-4 pb-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <RiBarChartLine className="text-primary text-xl" />
            <h3 className="text-xl font-semibold">Cobros por Día</h3>
          </div>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            isIconOnly
            onPress={() => refetch()}
            isLoading={isLoading}
          >
            <RiRefreshLine />
          </Button>
        </div>

        {/* Controles de fecha y botones de rangos predefinidos */}
        <div className="flex flex-col gap-3 w-full">
          <DateRangePicker
            label="Rango de fechas"
            value={{ start: startDate, end: endDate }}
            onChange={(range) => {
              if (range?.start && range?.end) {
                console.log("DateRangePicker onChange:", {
                  start: range.start,
                  end: range.end,
                  startFormatted: `${range.start.year}-${range.start.month.toString().padStart(2, '0')}-${range.start.day.toString().padStart(2, '0')}`,
                  endFormatted: `${range.end.year}-${range.end.month.toString().padStart(2, '0')}-${range.end.day.toString().padStart(2, '0')}`,
                });
                handleDateRangeChange(range.start, range.end);
              }
            }}
            className="max-w-sm"
            startContent={<RiCalendarLine className="text-default-400" />}
            showMonthAndYearPickers
            granularity="day"
          />

          <ButtonGroup size="sm" className="self-start">
            <Button variant="flat" onPress={setLast7Days}>
              Últimos 7 días
            </Button>
            <Button variant="flat" onPress={setLast30Days}>
              Últimos 30 días
            </Button>
            <Button variant="flat" onPress={setCurrentMonth}>
              Este mes
            </Button>
          </ButtonGroup>
        </div>

        {/* Métricas resumen */}
        {!isLoading && !error && dailyCollections && (
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="text-sm text-primary-600 dark:text-primary-400">Total Cobrado</div>
              <div className="text-lg font-bold text-primary-700 dark:text-primary-300">
                {formatCurrency(totalCollected)}
              </div>
            </div>
            <div className="text-center p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Total Pagos</div>
              <div className="text-lg font-bold text-secondary-700 dark:text-secondary-300">
                {totalPayments}
              </div>
            </div>
            <div className="text-center p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
              <div className="text-sm text-success-600 dark:text-success-400">Promedio Diario</div>
              <div className="text-lg font-bold text-success-700 dark:text-success-300">
                {formatCurrency(averageDaily)}
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardBody className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" label="Cargando datos de cobros..." />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-danger">
            <div className="text-lg font-medium mb-2">Error al cargar los datos</div>
            <Button
              color="danger"
              variant="flat"
              onPress={() => refetch()}
              startContent={<RiRefreshLine />}
            >
              Reintentar
            </Button>
          </div>
        ) : !dailyCollections || dailyCollections.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-default-500">
            <div className="text-center">
              <RiBarChartLine className="text-4xl mb-2 mx-auto" />
              <div className="text-lg font-medium">No hay datos de cobros</div>
              <div className="text-sm">en el rango de fechas seleccionado</div>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="displayDate" 
                  fontSize={12} 
                  stroke="#6b7280"
                />
                <YAxis 
                  fontSize={12}
                  stroke="#6b7280"
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("es-AR", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalCollected"
                  fill="#3b82f6"
                  name="Cobrado"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
} 