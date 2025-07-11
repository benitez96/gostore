import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import DefaultLayout from "@/layouts/default";
import { LoadingSpinner } from "@/shared/components/feedback";
import { useToast } from "@/shared/hooks/useToast";
import { useModal } from "@/shared/hooks/useModal";

import { ConfirmModal } from "@/shared/components/feedback";

import { api, ClientDetail, downloadSaleSheet } from "@/api";
import { ClientHeader } from "../components/ClientHeader";
import { SalesSection } from "@/features/sales/components/SalesSection";
import { PaymentModal } from "@/features/sales/components/PaymentModal";
import ClientForm from "@/components/ClientForm";
import { SaleForm } from "@/features/sales/components";

const statusTextMap = {
  1: "Al día",
  2: "Advertencia",
  3: "Deudor",
} as const;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { showSuccess, showApiError } = useToast();
  const editModal = useModal();
  const saleModal = useModal();
  const paymentModal = useModal();
  
  const [selectedSale, setSelectedSale] = useState<string>("");
  const [selectedQuota, setSelectedQuota] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirm modals
  const [confirmDeleteClient, setConfirmDeleteClient] = useState(false);
  const [confirmDeleteSale, setConfirmDeleteSale] = useState(false);
  const [confirmDeletePayment, setConfirmDeletePayment] = useState(false);
  const [selectedSaleToDelete, setSelectedSaleToDelete] = useState<any>(null);
  const [selectedPaymentToDelete, setSelectedPaymentToDelete] = useState<{ payment: any; quota: any } | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

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
    setConfirmDeleteClient(true);
  };

  const handleConfirmDeleteClient = async () => {
    setIsConfirmLoading(true);
    try {
      await api.delete(`/api/clients/${client.id}`);
      showSuccess("Cliente eliminado", "El cliente se ha eliminado exitosamente");
      navigate("/clientes");
    } catch (error) {
      showApiError("Error al eliminar cliente", error);
    } finally {
      setIsConfirmLoading(false);
      setConfirmDeleteClient(false);
    }
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
    setSelectedSaleToDelete(sale);
    setConfirmDeleteSale(true);
  };

  const handleConfirmDeleteSale = async () => {
    if (!selectedSaleToDelete) return;
    
    setIsConfirmLoading(true);
    try {
      await api.delete(`/api/sales/${selectedSaleToDelete.id}`);
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      showSuccess("Venta eliminada", "La venta se ha eliminado exitosamente");
    } catch (error) {
      showApiError("Error al eliminar venta", error);
    } finally {
      setIsConfirmLoading(false);
      setConfirmDeleteSale(false);
      setSelectedSaleToDelete(null);
    }
  };

  const handleDownloadSheet = async (saleId: string) => {
    try {
      await downloadSaleSheet(parseInt(saleId));
      showSuccess("PDF descargado", "La ficha de venta se ha descargado exitosamente");
    } catch (error) {
      showApiError("Error al descargar PDF", error);
    }
  };

  const handlePaymentClick = (quota: any, saleId: string) => {
    setSelectedQuota(quota);
    setSelectedSale(saleId);
    paymentModal.open();
  };

  const handleDeletePayment = (payment: any, quota: any) => {
    setSelectedPaymentToDelete({ payment, quota });
    setConfirmDeletePayment(true);
  };

  const handleConfirmDeletePayment = async () => {
    if (!selectedPaymentToDelete) return;
    
    setIsConfirmLoading(true);
    try {
      await api.delete(`/api/payments/${selectedPaymentToDelete.payment.id}`);
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      // También invalidar los detalles de la venta para actualizar los datos inmediatamente
      if (selectedSale) {
        queryClient.invalidateQueries({ queryKey: ["sale-details", selectedSale] });
      }
      showSuccess("Pago eliminado", "El pago se ha eliminado exitosamente");
    } catch (error) {
      showApiError("Error al eliminar pago", error);
    } finally {
      setIsConfirmLoading(false);
      setConfirmDeletePayment(false);
      setSelectedPaymentToDelete(null);
    }
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["client", id] });
    // También invalidar los detalles de la venta para actualizar los datos inmediatamente
    if (selectedSale) {
      queryClient.invalidateQueries({ queryKey: ["sale-details", selectedSale] });
    }
    setSelectedQuota(null);
    // No resetear selectedSale para mantener el acordeón abierto
    paymentModal.close();
  };

  return (
    <DefaultLayout>
      {/* Client Header */}
      <ClientHeader
        client={client}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
      />

      {/* Sales Section */}
      <SalesSection
        sales={client.sales || []}
        onDeleteSale={handleDeleteSale}
        onDownloadSheet={handleDownloadSheet}
        selectedSale={selectedSale}
        onSaleSelect={setSelectedSale}
        onPaymentClick={handlePaymentClick}
        onDeletePayment={handleDeletePayment}
        onCreateSale={handleCreateSale}
      />

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
        onClose={() => {
          paymentModal.close();
          setSelectedQuota(null);
          // No resetear selectedSale para mantener el acordeón abierto
        }}
        quota={selectedQuota}
        onSuccess={handlePaymentSuccess}
      />

      {/* Enhanced Confirm Modals */}
      <ConfirmModal
        isOpen={confirmDeleteClient}
        onClose={() => setConfirmDeleteClient(false)}
        onConfirm={handleConfirmDeleteClient}
        title="Eliminar Cliente"
        message="¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer."
        confirmText="Eliminar Cliente"
        cancelText="Cancelar"
        isLoading={isConfirmLoading}
        isDangerous={true}
        entityInfo={{
          "Nombre completo": `${client.name} ${client.lastname}`,
          DNI: client.dni,
          Estado: statusTextMap[client.state?.id as keyof typeof statusTextMap] || "Desconocido",
          "ID del cliente": `#${client.id}`,
          Email: client.email || "Sin email",
          Teléfono: client.phone || "Sin teléfono",
        }}
        impactList={[
          "Se eliminará toda la información del cliente",
          "Se eliminarán todas las ventas asociadas",
          "Se eliminarán todos los pagos realizados",
          "Se eliminarán todas las cuotas pendientes",
          "Se eliminarán todas las notas relacionadas",
        ]}
      />

      {selectedSaleToDelete && (
        <ConfirmModal
          isOpen={confirmDeleteSale}
          onClose={() => {
            setConfirmDeleteSale(false);
            setSelectedSaleToDelete(null);
          }}
          onConfirm={handleConfirmDeleteSale}
          title="Eliminar Venta"
          message="¿Estás seguro de que quieres eliminar esta venta? Esta acción no se puede deshacer."
          confirmText="Eliminar Venta"
          cancelText="Cancelar"
          isLoading={isConfirmLoading}
          isDangerous={true}
          entityInfo={{
            "ID de venta": `#${selectedSaleToDelete.id}`,
            "Monto total": formatCurrency(selectedSaleToDelete.total_amount || 0),
            "Fecha": selectedSaleToDelete.created_at ? new Date(selectedSaleToDelete.created_at).toLocaleDateString("es-AR") : "Sin fecha",
            "Cuotas": `${selectedSaleToDelete.quotas?.length || 0} cuotas`,
          }}
          impactList={[
            "Se eliminarán todas las cuotas asociadas a esta venta",
            "Se eliminarán todos los pagos registrados para estas cuotas",
            "Se eliminarán todos los productos asociados a esta venta",
            "Se recalculará el estado del cliente",
          ]}
        />
      )}

      {selectedPaymentToDelete && (
        <ConfirmModal
          isOpen={confirmDeletePayment}
          onClose={() => {
            setConfirmDeletePayment(false);
            setSelectedPaymentToDelete(null);
          }}
          onConfirm={handleConfirmDeletePayment}
          title="Eliminar Pago"
          message="¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer."
          confirmText="Eliminar Pago"
          cancelText="Cancelar"
          isLoading={isConfirmLoading}
          isDangerous={true}
          entityInfo={{
            "Cuota": `#${selectedPaymentToDelete.quota?.number}`,
            "Monto del pago": formatCurrency(selectedPaymentToDelete.payment?.amount || 0),
            "Fecha del pago": selectedPaymentToDelete.payment?.date ? new Date(selectedPaymentToDelete.payment.date).toLocaleDateString("es-AR") : "Sin fecha",
            "ID del pago": `#${selectedPaymentToDelete.payment?.id}`,
          }}
          impactList={[
            `La cuota volverá a tener un saldo pendiente de ${formatCurrency((selectedPaymentToDelete.quota?.amount || 0) - ((selectedPaymentToDelete.quota?.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0) - (selectedPaymentToDelete.payment?.amount || 0)))}`,
            "Se recalculará el estado de la cuota",
            "Se recalculará el estado del cliente",
          ]}
        />
      )}
    </DefaultLayout>
  );
} 