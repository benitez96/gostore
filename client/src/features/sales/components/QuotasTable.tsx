import { Tooltip } from "@heroui/tooltip";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import {
  LiaFileInvoiceDollarSolid,
  LiaTrashAltSolid,
  LiaReceiptSolid,
  LiaCreditCardSolid,
} from "react-icons/lia";
import { RiEditLine } from "react-icons/ri";

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

  const handleDownloadPaymentReceipt = async (paymentId: string | number) => {
    try {
      await downloadPaymentReceipt(paymentId);
      showSuccess("Comprobante generado", "El comprobante se descargó correctamente.");
    } catch (error) {
      showApiError("Error al generar comprobante", "No se pudo descargar el comprobante. Inténtalo de nuevo.");
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
                      <Tooltip content="Descargar comprobante">
                        <span
                          className="text-lg text-primary cursor-pointer active:opacity-50"
                          onClick={() =>
                            handleDownloadPaymentReceipt(payment.id)
                          }
                        >
                          <LiaFileInvoiceDollarSolid />
                        </span>
                      </Tooltip>
                      <Tooltip content="Eliminar pago">
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                          <LiaTrashAltSolid
                            onClick={() =>
                              onDeletePayment?.(payment, quota)
                            }
                          />
                        </span>
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
                    <span className="text-lg text-success cursor-pointer active:opacity-50">
                      <LiaReceiptSolid
                        onClick={() => onPaymentClick(quota)}
                      />
                    </span>
                  </Tooltip>
                )}
                <Tooltip content="Editar cuota">
                  <span className="text-lg text-primary cursor-pointer active:opacity-50">
                    <RiEditLine onClick={() => onEditQuota?.(quota)} />
                  </span>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 