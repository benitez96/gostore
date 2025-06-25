import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiUserLine,
  RiSearchLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import { IoPersonAddOutline } from "react-icons/io5";
import { LiaUserEditSolid } from "react-icons/lia";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { Client, ClientDetail, clientsApi } from "@/api";
import ClientForm from "@/components/ClientForm";
import ConfirmModal from "@/components/ConfirmModal";
import DefaultLayout from "@/layouts/default";
import { useToast } from "@/shared/hooks/useToast";
import { statusTextMap, statusOptions } from "@/shared/utils/constants";

import { useClients } from "../hooks/useClients";
import { ClientsTable } from "../components/ClientsTable";

export default function ClientsPage() {
  const navigate = useNavigate();
  const { showSuccess, showApiError } = useToast();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(["1", "2", "3"]));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDetail | null>(null);
  
  // Delete modal state
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use the clients hook
  const {
    items: clients,
    isLoading,
    hasMore,
    totalClients,
    loadMore,
    reload,
    loaderRef,
    scrollerRef,
  } = useClients({ searchFilter: search, statusFilter, limit: 10 });

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (keys: Set<string>) => {
    setStatusFilter(keys);
  };

  const handleCreateClient = async (clientData: Omit<ClientDetail, "id">) => {
    setIsSubmitting(true);
    try {
      await clientsApi.create(clientData);
      reload();
      showSuccess("Cliente creado", "El cliente se ha creado exitosamente");
      setIsFormOpen(false);
      setEditingClient(null);
    } catch (error: any) {
      console.error("Error creating client:", error);
      showApiError("Error al crear cliente", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async (clientData: Omit<ClientDetail, "id">) => {
    if (!editingClient) return;

    setIsSubmitting(true);
    try {
      await clientsApi.update(editingClient.id, clientData);
      reload();
      showSuccess("Cliente actualizado", "El cliente se ha actualizado exitosamente");
      setIsFormOpen(false);
      setEditingClient(null);
    } catch (error: any) {
      console.error("Error updating client:", error);
      showApiError("Error al actualizar cliente", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = async (client: Client) => {
    try {
      const clientDetail = await clientsApi.getById(client.id);
      setEditingClient(clientDetail);
      setIsFormOpen(true);
    } catch (error: any) {
      console.error("Error fetching client details:", error);
      showApiError("Error al cargar cliente", error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleOpenCreateForm = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleViewClient = (client: Client) => {
    navigate(`/clientes/${client.id}`);
  };

  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingClient) return;

    setIsDeleting(true);
    try {
      await clientsApi.delete(deletingClient.id);
      reload();
      showSuccess(
        "Cliente eliminado",
        `${deletingClient.name} ${deletingClient.lastname} ha sido eliminado exitosamente`
      );
      setIsDeleteModalOpen(false);
      setDeletingClient(null);
    } catch (error: any) {
      console.error("Error deleting client:", error);
      showApiError("Error al eliminar cliente", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingClient(null);
  };



  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6">
        {/* Header con título y botón de crear */}
        <div className="flex items-center justify-between max-w-7xl w-full px-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <RiUserLine className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Clientes
              </h1>
              <p className="text-default-500">
                Gestiona tu base de datos de clientes
              </p>
            </div>
          </div>
          <Button
            className="font-medium"
            color="primary"
            startContent={<IoPersonAddOutline />}
            variant="flat"
            onPress={handleOpenCreateForm}
          >
            Crear Cliente
          </Button>
        </div>

        <div className="max-w-7xl w-full px-4">
          {/* Top Content */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-3 items-end">
              <Input
                isClearable
                onClear={() => handleSearchChange("")}
                className="w-full sm:max-w-[44%]"
                placeholder="Buscar por nombre, apellido o DNI..."
                startContent={<RiSearchLine className="text-default-400" />}
                value={search}
                onValueChange={handleSearchChange}
              />
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    endContent={<RiArrowDownSLine className="text-small" />}
                    variant="flat"
                  >
                    {statusFilter.size === statusOptions.length 
                      ? "Estado" 
                      : `Estado (${statusFilter.size})`
                    }
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Filtro de estados"
                  closeOnSelect={false}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={(keys) => {
                    handleStatusFilterChange(new Set(Array.from(keys).map(String)));
                  }}
                >
                  {statusOptions.map((status) => (
                    <DropdownItem key={status.uid} className="capitalize">
                      {status.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-default-400 text-small">
                Total {totalClients} clientes
              </span>
            </div>
          </div>

          {/* Tabla de clientes */}
          <ClientsTable
            clients={clients}
            isLoading={isLoading}
            hasMore={hasMore}
            loaderRef={loaderRef}
            scrollerRef={scrollerRef}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onView={handleViewClient}
          />
        </div>

        {/* Client Form Modal */}
        <ClientForm
          initialData={editingClient || undefined}
          isLoading={isSubmitting}
          isOpen={isFormOpen}
          submitText={editingClient ? "Actualizar Cliente" : "Crear Cliente"}
          title={
            <div className="flex items-center gap-2">
              {editingClient ? (
                <LiaUserEditSolid className="text-2xl text-primary" />
              ) : (
                <IoPersonAddOutline className="text-2xl text-primary" />
              )}
              <h2 className="text-xl font-semibold text-foreground">
                {editingClient ? "Editar Cliente" : "Crear Cliente"}
              </h2>
            </div>
          }
          onClose={handleCloseForm}
          onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          cancelText="Cancelar"
          confirmText="Eliminar"
          entityInfo={
            deletingClient
              ? {
                  "Nombre completo": `${deletingClient.name} ${deletingClient.lastname}`,
                  DNI: deletingClient.dni,
                  Estado: statusTextMap[deletingClient.state?.id as keyof typeof statusTextMap] || "Desconocido",
                  "ID del cliente": `#${deletingClient.id}`,
                }
              : undefined
          }
          impactList={[
            "Se eliminará toda la información del cliente",
            "Se eliminarán todas las ventas asociadas",
            "Se eliminarán todos los pagos realizados",
            "Se eliminarán todas las cuotas pendientes",
            "Se eliminarán todas las notas relacionadas",
          ]}
          isDangerous={true}
          isLoading={isDeleting}
          isOpen={isDeleteModalOpen}
          message="¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer."
          title="Eliminar Cliente"
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </section>
    </DefaultLayout>
  );
} 