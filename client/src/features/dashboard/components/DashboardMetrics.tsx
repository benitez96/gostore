import { Card, CardBody } from "@heroui/card";
import {
  RiUserLine,
  RiShoppingBagLine,
  RiBarChartLine,
  RiMoneyDollarCircleLine,
  RiCheckLine,
  RiCalendarLine,
} from "react-icons/ri";

import { formatCurrency } from "@/shared/utils/formatters";

export interface DashboardStats {
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

export interface DashboardMetricsProps {
  stats: DashboardStats;
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  return (
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
              {stats.totalClients || 0}
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
              {stats.totalProducts || 0}
            </p>
            <span className="text-xs text-default-500">En catálogo</span>
          </div>
        </CardBody>
      </Card>

      {/* Total Ventas - 1 columna, 2 filas (row-span-2) */}
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
              {stats.totalSales || 0}
            </p>
            <span className="text-xs text-default-500">
              {stats.activeSales || 0} activas
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
                {formatCurrency(stats.collectedThisMonth || 0)}
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
            {stats.paidQuotasDueThisMonth || 0}
            <span className="text-default-500">
              {" "} / {stats.countQuotasDueThisMonth || 0}
            </span>
          </p>
          <span className="text-xs text-default-500 mt-1">Este mes</span>
        </CardBody>
      </Card>

      {/* Pendiente por Cobrar - 2 columnas, 2 fila */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardBody className="p-6 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-lg text-default-600 font-medium">
                Pendiente por Cobrar
              </p>
              <p className="text-3xl font-bold text-danger mt-2 text-balance">
                {formatCurrency(stats.pendingAmount || 0)}
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
            {stats.paidQuotasDueLastMonth || 0}
            <span className="text-default-500">
              {" "} / {stats.countQuotasDueLastMonth || 0}
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
                {formatCurrency(stats.collectedFromQuotasDueThisMonth || 0)}
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
                {formatCurrency(stats.quotasDueThisMonth || 0)}
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
                {formatCurrency(stats.quotasDueNextMonth || 0)}
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
                {formatCurrency(stats.totalRevenue || 0)}
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
  );
} 