import { Button } from "@heroui/button";
import { LiaPlusSolid, LiaFileInvoiceDollarSolid } from "react-icons/lia";

import { SalesList } from "./SalesList";

export interface SalesSectionProps {
  sales: any[];
  onDeleteSale: (sale: any) => void;
  onDownloadSheet: (saleId: string) => void;
  selectedSale: string;
  onSaleSelect: (saleId: string) => void;
  onPaymentClick: (quota: any, saleId: string) => void;
  onDeletePayment: (payment: any, quota: any) => void;
  onCreateSale: () => void;
}

export function SalesSection({
  sales,
  onDeleteSale,
  onDownloadSheet,
  selectedSale,
  onSaleSelect,
  onPaymentClick,
  onDeletePayment,
  onCreateSale,
}: SalesSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-6">
      {/* Header de la sección de ventas */}
      <div className="bg-content1 border border-default-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <LiaFileInvoiceDollarSolid className="text-2xl text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Ventas</h2>
              <p className="text-sm text-default-500">
                {sales?.length || 0} ventas registradas
              </p>
            </div>
          </div>
          <Button
            color="primary"
            size="sm"
            startContent={<LiaPlusSolid />}
            onPress={onCreateSale}
          >
            Crear Venta
          </Button>
        </div>
        {/* Lista de ventas */}
      {sales && sales.length > 0 ? (
        <SalesList
          sales={sales}
          onDeleteSale={onDeleteSale}
          onDownloadSheet={onDownloadSheet}
          selectedSale={selectedSale}
          onSaleSelect={onSaleSelect}
          onPaymentClick={onPaymentClick}
          onDeletePayment={onDeletePayment}
        />
      ) : (
        <div className="bg-content1 border border-default-200 rounded-lg p-8 text-center">
          <LiaFileInvoiceDollarSolid className="text-4xl mx-auto mb-3 text-default-300" />
          <p className="text-default-500 mb-4">No hay ventas registradas para este cliente</p>
          <Button
            color="primary"
            size="sm"
            startContent={<LiaPlusSolid />}
            onPress={onCreateSale}
          >
            Crear Primera Venta
          </Button>
        </div>
      )}
      </div>
    </div>
  );
} 