import { Tooltip } from "@heroui/tooltip";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import {
  LiaFileInvoiceDollarSolid,
  LiaTrashAltSolid,
  LiaReceiptSolid,
} from "react-icons/lia";
import { RiEditLine } from "react-icons/ri";
import { useState } from "react";

import { downloadPaymentReceipt } from "@/api";
import { CurrencyDisplay, DateDisplay, StatusChip } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks/useToast";

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
  const { showSuccess, showApiError } = useToast();
  const [downloadingIds, setDownloadingIds] = useState<Set<string | number>>(new Set());

  const handleDownloadPaymentReceipt = async (paymentId: string | number) => {
    setDownloadingIds(prev => new Set(prev).add(paymentId));
    try {
      await downloadPaymentReceipt(paymentId);
      showSuccess("Comprobante generado", "El comprobante se descargó correctamente.");
    } catch (error) {
      showApiError("Error al generar comprobante", "No se pudo descargar el comprobante. Inténtalo de nuevo.");
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    }
  };

  return (
    <Table aria-label="Cuotas de la venta">
      <TableHeader>
        <TableColumn>Número</TableColumn>
        <TableColumn>Monto</TableColumn>
        <TableColumn>Vencimiento</TableColumn>
        <TableColumn>Estado</TableColumn>
        <TableColumn>Pagos</TableColumn>
        <TableColumn>Acciones</TableColumn>
      </TableHeader>
      <TableBody>
        {quotas.map((quota: any) => (
          <TableRow key={quota.id}>
            <TableCell>
              <span className="font-medium">#{quota.number}</span>
            </TableCell>
            <TableCell>
              <span className="font-medium">
                <CurrencyDisplay amount={quota.amount} />
              </span>
            </TableCell>
            <TableCell>
              <DateDisplay date={quota.due_date} />
            </TableCell>
            <TableCell>
              <StatusChip status={quota.state} type="quota" data={quota} />
            </TableCell>
            <TableCell>
              {quota.payments && quota.payments.length > 0 ? (
                <div className="space-y-1">
                  {quota.payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <LiaReceiptSolid className="text-success" />
                      <CurrencyDisplay amount={payment.amount} size="sm" />
                      <DateDisplay date={payment.date} className="text-xs" />
                      <Tooltip content={
                        downloadingIds.has(payment.id) 
                          ? "Generando comprobante..." 
                          : "Descargar comprobante"
                      }>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="primary"
                          isLoading={downloadingIds.has(payment.id)}
                          isDisabled={downloadingIds.has(payment.id)}
                          onPress={() => handleDownloadPaymentReceipt(payment.id)}
                        >
                          <LiaFileInvoiceDollarSolid />
                        </Button>
                      </Tooltip>
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
              ) : (
                <span className="text-default-500 text-sm">
                  Sin pagos
                </span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2 justify-center">
                {!quota.is_paid && (
                  <Tooltip content="Realizar pago">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="success"
                      onPress={() => onPaymentClick(quota)}
                    >
                      <LiaReceiptSolid />
                    </Button>
                  </Tooltip>
                )}
                <Tooltip content="Editar cuota">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="primary"
                    onPress={() => onEditQuota?.(quota)}
                  >
                    <RiEditLine />
                  </Button>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 