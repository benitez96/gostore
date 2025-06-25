import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import DefaultLayout from "@/layouts/default";
import { LoadingSpinner } from "@/shared/components/feedback";
import { useToast } from "@/shared/hooks/useToast";
import { useModal } from "@/shared/hooks/useModal";
import { useConfirmModal } from "@/shared/hooks/useConfirmModal";
import { ConfirmModal } from "@/shared/components/feedback";

import { api, ClientDetail, downloadSaleSheet } from "@/api";
import { ClientHeader } from "../components/ClientHeader";
import { SalesList } from "@/features/sales/components/SalesList";
import { PaymentModal } from "@/features/sales/components/PaymentModal";
import ClientForm from "@/components/ClientForm";
import SaleForm from "@/components/SaleForm";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { showSuccess, showApiError } = useToast();
  const editModal = useModal();
  const saleModal = useModal();
  const paymentModal = useModal();
  const confirmModal = useConfirmModal();
  
  const [selectedSale, setSelectedSale] = useState<string>("");
  const [selectedQuota, setSelectedQuota] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch client data
  const {
    data: client,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: async (): Promise<ClientDetail> => {
      if (!id) throw new Error("Client ID is required");
      const response = await api.get(`/api/clients/${id}`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Loading state
  if (isLoading) {
    return (
      <DefaultLayout>
        <LoadingSpinner fullPage label="Cargando cliente..." />
      </DefaultLayout>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <DefaultLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-danger mb-2">
            Error al cargar cliente
          </h2>
          <p className="text-default-600 mb-4">
            No se pudo cargar la información del cliente.
          </p>
          <button 
            onClick={() => navigate("/clientes")}
            className="text-primary hover:underline"
          >
            Volver a clientes
          </button>
        </div>
      </DefaultLayout>
    );
  }

  // Handlers
  const handleEditClient = () => {
    editModal.open();
  };

  const handleDeleteClient = () => {
    confirmModal.openConfirm({
      title: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar el cliente "${client.name} ${client.lastname}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar Cliente",
      onConfirm: async () => {
        try {
          await api.delete(`/api/clients/${client.id}`);
          showSuccess("Cliente eliminado", "El cliente se ha eliminado exitosamente");
          navigate("/clientes");
        } catch (error) {
          showApiError("Error al eliminar cliente", error);
        }
      },
    });
  };

  const handleCreateSale = () => {
    saleModal.open();
  };

  const handleFormSubmit = async (clientData: Omit<ClientDetail, "id">) => {
    setIsSubmitting(true);
    try {
      await api.put(`/api/clients/${client.id}`, clientData);
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      showSuccess("Cliente actualizado", "El cliente se ha actualizado exitosamente");
      editModal.close();
    } catch (error) {
      showApiError("Error al actualizar cliente", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSale = (sale: any) => {
    confirmModal.openConfirm({
      title: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar la venta #${sale.id}? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar Venta",
      onConfirm: async () => {
        try {
          await api.delete(`/api/sales/${sale.id}`);
          queryClient.invalidateQueries({ queryKey: ["client", id] });
          showSuccess("Venta eliminada", "La venta se ha eliminado exitosamente");
        } catch (error) {
          showApiError("Error al eliminar venta", error);
        }
      },
    });
  };

  const handleDownloadSheet = async (saleId: string) => {
    try {
      await downloadSaleSheet(parseInt(saleId));
      showSuccess("PDF descargado", "La ficha de venta se ha descargado exitosamente");
    } catch (error) {
      showApiError("Error al descargar PDF", error);
    }
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["client", id] });
    setSelectedQuota(null);
  };

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Client Header */}
        <ClientHeader
          client={client}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          onCreateSale={handleCreateSale}
        />

        {/* Sales Section */}
        <SalesList
          sales={client.sales || []}
          onDeleteSale={handleDeleteSale}
          onDownloadSheet={handleDownloadSheet}
          selectedSale={selectedSale}
          onSaleSelect={setSelectedSale}
        />
      </div>

      {/* Modals */}
      <ClientForm
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        onSubmit={handleFormSubmit}
        initialData={client}
        title="Editar Cliente"
        submitText="Actualizar Cliente"
        isLoading={isSubmitting}
      />

      <SaleForm
        isOpen={saleModal.isOpen}
        onClose={saleModal.close}
        clientId={client.id.toString()}
        clientName={`${client.name} ${client.lastname}`}
      />

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={paymentModal.close}
        quota={selectedQuota}
        saleId={selectedSale}
        onSuccess={handlePaymentSuccess}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeConfirm}
        onConfirm={confirmModal.handleConfirm}
        title={confirmModal.config?.title || ""}
        message={confirmModal.config?.message || ""}
        confirmText={confirmModal.config?.confirmText}
        cancelText={confirmModal.config?.cancelText}
        isLoading={confirmModal.isLoading}
      />
    </DefaultLayout>
  );
} 