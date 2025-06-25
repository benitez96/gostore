import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { LiaCreditCardSolid, LiaEditSolid, LiaTrashAltSolid } from "react-icons/lia";

import { CurrencyDisplay, DateDisplay, StatusChip } from "@/shared/components/ui";

export interface QuotasTableProps {
  quotas: any[];
  onPaymentClick: (quota: any) => void;
  onEditQuota?: (quota: any) => void;
  onDeletePayment?: (payment: any, quota: any) => void;
}

export function QuotasTable({
  quotas,
  onPaymentClick,
  onEditQuota,
  onDeletePayment,
}: QuotasTableProps) {
  const renderPayments = (quota: any) => {
    if (!quota.payments || quota.payments.length === 0) {
      return <span className="text-default-400">Sin pagos</span>;
    }

    return (
      <div className="flex flex-col gap-1">
        {quota.payments.map((payment: any, index: number) => (
          <div key={index} className="flex items-center justify-between bg-default-50 p-2 rounded">
            <div className="flex flex-col">
              <CurrencyDisplay amount={payment.amount} size="sm" />
              <DateDisplay date={payment.date} className="text-xs" />
            </div>
            <Tooltip content="Eliminar pago">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => onDeletePayment?.(payment, quota)}
              >
                <LiaTrashAltSolid />
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>
    );
  };

  const calculatePendingAmount = (quota: any) => {
    const totalPaid = quota.payments?.reduce(
      (sum: number, payment: any) => sum + payment.amount,
      0,
    ) || 0;
    return quota.amount - totalPaid;
  };

  return (
    <Table aria-label="Tabla de cuotas">
      <TableHeader>
        <TableColumn>Cuota</TableColumn>
        <TableColumn>Monto</TableColumn>
        <TableColumn>Vencimiento</TableColumn>
        <TableColumn>Estado</TableColumn>
        <TableColumn>Pagos</TableColumn>
        <TableColumn>Pendiente</TableColumn>
        <TableColumn>Acciones</TableColumn>
      </TableHeader>
      <TableBody items={quotas}>
        {(quota) => (
          <TableRow key={quota.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-semibold">#{quota.number}</span>
              </div>
            </TableCell>
            <TableCell>
              <CurrencyDisplay amount={quota.amount} />
            </TableCell>
            <TableCell>
              <DateDisplay date={quota.due_date} />
            </TableCell>
            <TableCell>
              <StatusChip status={quota.state} type="quota" data={quota} />
            </TableCell>
            <TableCell>{renderPayments(quota)}</TableCell>
            <TableCell>
              <CurrencyDisplay amount={calculatePendingAmount(quota)} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Tooltip content="Registrar pago">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="success"
                    onPress={() => onPaymentClick(quota)}
                    isDisabled={quota.is_paid}
                  >
                    <LiaCreditCardSolid />
                  </Button>
                </Tooltip>
                <Tooltip content="Editar cuota">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="warning"
                    onPress={() => onEditQuota?.(quota)}
                  >
                    <LiaEditSolid />
                  </Button>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 