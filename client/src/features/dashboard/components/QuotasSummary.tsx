import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Progress } from "@heroui/progress";
import { RiCalendarLine } from "react-icons/ri";

import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { EmptyState } from "@/shared/components/feedback";

export interface QuotaData {
  month: string;
  total_amount: number;
  amount_paid: number;
  amount_not_paid: number;
}

export interface QuotasSummaryProps {
  quotaData: QuotaData[];
}

export function QuotasSummary({ quotaData }: QuotasSummaryProps) {
  if (!quotaData || quotaData.length === 0) {
    return (
      <EmptyState
        title="No hay datos de cuotas disponibles"
        description="No se encontraron datos de cuotas para mostrar."
        icon={<RiCalendarLine className="text-4xl text-default-400" />}
      />
    );
  }

  const getMonthStatus = (paid: number, notPaid: number) => {
    if (notPaid === 0) return { color: "success" as const, text: "Completado" };
    if (paid === 0) return { color: "danger" as const, text: "Pendiente" };
    return { color: "warning" as const, text: "Parcial" };
  };

  const calculatePercentage = (paid: number, total: number) => {
    return total > 0 ? ((paid / total) * 100).toFixed(1) : "0";
  };

  const getProgressValue = (paid: number, total: number) => {
    return total > 0 ? (paid / total) * 100 : 0;
  };

  return (
    <div className="space-y-4">
      {quotaData.map((month: QuotaData, index: number) => {
        const status = getMonthStatus(month.amount_paid, month.amount_not_paid);
        const percentage = calculatePercentage(month.amount_paid, month.total_amount);
        const progressValue = getProgressValue(month.amount_paid, month.total_amount);

        return (
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
                  <p className="text-sm text-default-600">Monto Total</p>
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
                  <p className="text-sm text-default-600">Pendiente</p>
                  <p className="text-xl font-bold text-warning">
                    {formatCurrency(month.amount_not_paid)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-default-600">Porcentaje Pagado</p>
                  <p className="text-xl font-bold">{percentage}%</p>
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
                    value={progressValue}
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
                      color={status.color}
                      size="sm"
                      variant="flat"
                    >
                      {status.text}
                    </Chip>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
} 