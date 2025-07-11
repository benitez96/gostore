import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@heroui/spinner";
import {
  LiaCalendarAltSolid,
  LiaMoneyBillWaveSolid,
  LiaCreditCardSolid,
} from "react-icons/lia";
import { RiShoppingBagLine } from "react-icons/ri";

import { api } from "@/api";
import { EditQuotaModal } from "./EditQuotaModal";
import { QuotasTable } from "./QuotasTable";
import { SaleProductsTable } from "./SaleProductsTable";
import { NotesSection } from "./NotesSection";
import { CurrencyDisplay, DateDisplay } from "@/shared/components/ui";



export interface SaleDetailProps {
  saleId: string;
  onPaymentClick: (quota: any, saleId: string) => void;
  onDeletePayment: (payment: any, quota: any) => void;
}

export function SaleDetail({ saleId, onPaymentClick, onDeletePayment }: SaleDetailProps) {
  const queryClient = useQueryClient();
  
  const [isCostVisible, setIsCostVisible] = useState(false);
  const [isEditQuotaModalOpen, setIsEditQuotaModalOpen] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState<any>(null);

  const {
    data: saleDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sale-details", saleId],
    queryFn: async () => {
      const response = await api.get(`/api/sales/${saleId}`);
      return response.data;
    },
    enabled: !!saleId,
  });



  const handlePayment = (quota: any) => {
    setSelectedQuota(quota);
    onPaymentClick(quota, saleId);
  };

  const handleEditQuota = (quota: any) => {
    setSelectedQuota(quota);
    setIsEditQuotaModalOpen(true);
  };

  const handleEditQuotaSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["sale-details", saleId] });
    queryClient.invalidateQueries({ queryKey: ["client"] });
    setIsEditQuotaModalOpen(false);
    setSelectedQuota(null);
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="sm" />
        <span className="ml-2 text-sm text-default-500">
          Cargando detalles...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-danger">
        <p>Error al cargar los detalles de la venta</p>
      </div>
    );
  }

  if (!saleDetails) {
    return (
      <div className="text-center py-8 text-default-500">
        <p>No se encontraron detalles de la venta</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">


      {/* Información básica de la venta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-default-50 rounded-lg">
        <div className="flex items-center gap-2">
          <LiaCalendarAltSolid className="text-default-500" />
          <div>
            <p className="text-sm text-default-500">Fecha</p>
            <p className="font-medium">
              <DateDisplay date={saleDetails.date} />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LiaMoneyBillWaveSolid className="text-default-500" />
          <div>
            <p className="text-sm text-default-500">Monto total</p>
            <p className="font-medium">
              {saleDetails.amount ? (
                <CurrencyDisplay amount={saleDetails.amount} />
              ) : (
                "Sin monto"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LiaCreditCardSolid className="text-default-500" />
          <div>
            <p className="text-sm text-default-500">Cuotas</p>
            <p className="font-medium">
              {saleDetails.quotas?.length || 0} cuotas
            </p>
          </div>
        </div>
      </div>

      {/* Información adicional de la venta */}
      {saleDetails.quota_price && saleDetails.quotas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-default-50 rounded-lg">
          <div className="flex items-center gap-2">
            <LiaCreditCardSolid className="text-default-500" />
            <div>
              <p className="text-sm text-default-500">Precio por cuota</p>
              <p className="font-medium">
                <CurrencyDisplay amount={saleDetails.quota_price} />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LiaMoneyBillWaveSolid className="text-default-500" />
            <div>
              <p className="text-sm text-default-500">Total en cuotas</p>
              <p className="font-medium">
                <CurrencyDisplay
                  amount={saleDetails.quota_price * saleDetails.quotas.length}
                />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Productos de la venta */}
      {saleDetails.products && saleDetails.products.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <RiShoppingBagLine />
            Productos
          </h4>
          <SaleProductsTable
            products={saleDetails.products}
            isCostVisible={isCostVisible}
            onToggleCostVisibility={() => setIsCostVisible(!isCostVisible)}
          />
        </div>
      )}

      {/* Tabla de cuotas */}
      {saleDetails.quotas && saleDetails.quotas.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <LiaCreditCardSolid />
            Cuotas
          </h4>
          <QuotasTable
            quotas={saleDetails.quotas}
            onPaymentClick={handlePayment}
            onEditQuota={handleEditQuota}
            onDeletePayment={onDeletePayment}
          />
        </div>
      )}

      {/* Sección de Notas */}
      <NotesSection saleId={saleId} notes={saleDetails.notes || []} />

      {/* Modal de edición de cuota */}
      {isEditQuotaModalOpen && selectedQuota && (
        <EditQuotaModal
          isOpen={isEditQuotaModalOpen}
          quota={selectedQuota}
          onClose={() => {
            setIsEditQuotaModalOpen(false);
            setSelectedQuota(null);
          }}
          onSuccess={handleEditQuotaSuccess}
        />
      )}
    </div>
  );
} 