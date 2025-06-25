import { Accordion, AccordionItem } from "@heroui/accordion";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { LiaFileInvoiceDollarSolid, LiaTrashAltSolid, LiaDownloadSolid } from "react-icons/lia";

import { SaleDetail } from "@/features/sales/components/SaleDetail";
import { CurrencyDisplay, DateDisplay, StatusChip } from "@/shared/components/ui";



export interface SalesListProps {
  sales: any[];
  onDeleteSale: (sale: any) => void;
  onDownloadSheet: (saleId: string) => void;
  selectedSale: string;
  onSaleSelect: (saleId: string) => void;
  onPaymentClick: (quota: any, saleId: string) => void;
  onDeletePayment: (payment: any, quota: any) => void;
}

export function SalesList({
  sales,
  onDeleteSale,
  onDownloadSheet,
  selectedSale,
  onSaleSelect,
  onPaymentClick,
  onDeletePayment,
}: SalesListProps) {
  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-8 text-default-500">
        <LiaFileInvoiceDollarSolid className="text-4xl mx-auto mb-2" />
        <p>No hay ventas registradas para este cliente</p>
      </div>
    );
  }

  return (
    <Accordion
      className="gap-2"
      variant="splitted"
      selectedKeys={selectedSale ? [selectedSale] : []}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0];
        onSaleSelect(selected ? selected.toString() : "");
      }}
    >
      {sales.map((sale: any) => {
        return (
          <AccordionItem
            key={sale.id.toString()}
            aria-label={`Venta #${sale.id}`}
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <LiaFileInvoiceDollarSolid className="text-xl text-primary" />
                  <div>
                    <p className="font-medium">{sale.description || `Venta #${sale.id}`}</p>
                    <div className="flex items-center gap-4 text-sm text-default-500">
                      <span>#{sale.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip status={sale.state} type="sale" data={sale} />
                  <Tooltip content="Descargar ficha de venta">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => onDownloadSheet(sale.id.toString())}
                    >
                      <LiaFileInvoiceDollarSolid />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Eliminar venta">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => onDeleteSale(sale)}
                    >
                      <LiaTrashAltSolid />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            }
          >
            <SaleDetail
              saleId={sale.id.toString()}
              onPaymentClick={onPaymentClick}
              onDeletePayment={onDeletePayment}
            />
          </AccordionItem>
        );
      })}
    </Accordion>
  );
} 