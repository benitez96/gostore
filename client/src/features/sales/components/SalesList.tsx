import { Accordion, AccordionItem } from "@heroui/accordion";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import { RiDeleteBinLine, RiShoppingBagLine } from "react-icons/ri";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";

import { CurrencyDisplay, DateDisplay, StatusChip } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/feedback";

export interface SalesListProps {
  sales: any[];
  onDeleteSale: (sale: any) => void;
  onDownloadSheet: (saleId: string) => void;
  selectedSale?: string;
  onSaleSelect?: (saleId: string) => void;
}

export function SalesList({
  sales,
  onDeleteSale,
  onDownloadSheet,
  selectedSale,
  onSaleSelect,
}: SalesListProps) {
  if (!sales || sales.length === 0) {
    return (
      <EmptyState
        title="Sin ventas registradas"
        description="Este cliente aún no tiene ventas registradas. Puedes crear una nueva venta usando el botón de arriba."
        icon={<RiShoppingBagLine className="text-4xl text-default-300" />}
      />
    );
  }

  const calculateSaleTotal = (sale: any) => {
    return sale.products?.reduce((total: number, product: any) => 
      total + (product.price * product.quantity), 0
    ) || 0;
  };

  const calculateTotalPaid = (sale: any) => {
    return sale.quotas?.reduce((total: number, quota: any) => {
      const quotaPaid = quota.payments?.reduce((sum: number, payment: any) => 
        sum + payment.amount, 0
      ) || 0;
      return total + quotaPaid;
    }, 0) || 0;
  };

  const calculatePendingAmount = (sale: any) => {
    return calculateSaleTotal(sale) - calculateTotalPaid(sale);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ventas ({sales.length})</h2>
      </div>

      <Accordion
        variant="splitted"
        selectedKeys={selectedSale ? [selectedSale] : []}
        onSelectionChange={(keys) => {
          const keyArray = Array.from(keys);
          if (keyArray.length > 0 && onSaleSelect) {
            onSaleSelect(keyArray[0] as string);
          }
        }}
      >
        {sales.map((sale) => {
          const totalAmount = calculateSaleTotal(sale);
          const paidAmount = calculateTotalPaid(sale);
          const pendingAmount = calculatePendingAmount(sale);

          return (
            <AccordionItem
              key={sale.id}
              title={
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        Venta #{sale.id}
                      </span>
                      <DateDisplay date={sale.date} className="text-sm text-default-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <CurrencyDisplay amount={totalAmount} className="font-semibold" />
                      <div className="text-sm text-default-500">
                        {sale.quotas?.length || 0} cuota{(sale.quotas?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <StatusChip status={sale.state} type="sale" data={sale} />
                  </div>
                </div>
              }
            >
              <div className="space-y-4">
                {/* Sale Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-default-50 rounded-lg">
                  <div>
                    <p className="text-sm text-default-600">Total</p>
                    <CurrencyDisplay amount={totalAmount} className="font-semibold" />
                  </div>
                  <div>
                    <p className="text-sm text-default-600">Pagado</p>
                    <CurrencyDisplay amount={paidAmount} className="font-semibold text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-default-600">Pendiente</p>
                    <CurrencyDisplay amount={pendingAmount} className="font-semibold text-warning" />
                  </div>
                </div>

                <Divider />

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Tooltip content="Descargar ficha de venta">
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<LiaFileInvoiceDollarSolid />}
                        onPress={() => onDownloadSheet(sale.id)}
                      >
                        Descargar PDF
                      </Button>
                    </Tooltip>
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    startContent={<RiDeleteBinLine />}
                    onPress={() => onDeleteSale(sale)}
                  >
                    Eliminar Venta
                  </Button>
                </div>
              </div>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
} 