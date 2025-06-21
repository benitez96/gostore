import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { RiUserLine, RiSearchLine, RiAddLine, RiEyeLine, RiEditLine, RiDeleteBinLine } from "react-icons/ri";
import { IoPersonAddOutline } from "react-icons/io5";
import { LiaUserEditSolid } from "react-icons/lia";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Tooltip } from "@heroui/tooltip";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";
import { useClients } from "@/hooks/useClients";
import { Client, ClientDetail, clientsApi } from "@/api";
import ClientForm from "@/components/ClientForm";
import ConfirmModal from "@/components/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";

const statusColorMap = {
  1: "success",
  2: "warning", 
  3: "danger",
} as const;

const statusTextMap = {
  1: "Al día",
  2: "Advertencia",
  3: "Deudor",
} as const;

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDetail | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const observerRef = useRef<HTMLDivElement>(null);

  // Debounce search with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useClients(debouncedSearch);

  const clients = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.clients || []);
  }, [data]);

  // Infinite scroll observer
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreateClient = async (clientData: Omit<ClientDetail, 'id'>) => {
    setIsSubmitting(true);
    try {
      await clientsApi.create(clientData);
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      addToast({
        title: "Cliente creado",
        description: "El cliente se ha creado exitosamente",
        color: "success",
      });
    } catch (error: any) {
      console.error("Error creating client:", error);
      
      // Extract error message from API response
      const errorMessage = error.response?.data?.msg || error.message || "No se pudo crear el cliente. Inténtalo de nuevo.";
      
      addToast({
        title: "Error al crear cliente",
        description: errorMessage,
        color: "danger",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async (clientData: Omit<ClientDetail, 'id'>) => {
    if (!editingClient) return;
    
    setIsSubmitting(true);
    try {
      await clientsApi.update(editingClient.id, clientData);
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      addToast({
        title: "Cliente actualizado",
        description: "El cliente se ha actualizado exitosamente",
        color: "success",
      });
    } catch (error: any) {
      console.error("Error updating client:", error);
      
      // Extract error message from API response
      const errorMessage = error.response?.data?.msg || error.message || "No se pudo actualizar el cliente. Inténtalo de nuevo.";
      
      addToast({
        title: "Error al actualizar cliente",
        description: errorMessage,
        color: "danger",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = async (client: Client) => {
    try {
      // Fetch full client details
      const clientDetail = await clientsApi.getById(client.id);
      setEditingClient(clientDetail);
      setIsFormOpen(true);
    } catch (error: any) {
      console.error("Error fetching client details:", error);
      
      // Extract error message from API response
      const errorMessage = error.response?.data?.msg || error.message || "No se pudieron cargar los datos del cliente.";
      
      addToast({
        title: "Error al cargar cliente",
        description: errorMessage,
        color: "danger",
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleOpenCreateForm = () => {
    setEditingClient(null); // Ensure we're in create mode
    setIsFormOpen(true);
  };

  const handleViewClient = (client: Client) => {
    // TODO: Implement view client details
    addToast({
      title: "Ver detalles",
      description: `Viendo detalles de ${client.name} ${client.lastname}`,
      color: "primary",
    });
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
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      addToast({
        title: "Cliente eliminado",
        description: `${deletingClient.name} ${deletingClient.lastname} ha sido eliminado exitosamente`,
        color: "success",
      });
      
      // Close modal and reset state
      setIsDeleteModalOpen(false);
      setDeletingClient(null);
    } catch (error: any) {
      console.error("Error deleting client:", error);
      
      // Extract error message from API response
      const errorMessage = error.response?.data?.msg || error.message || "No se pudo eliminar el cliente. Inténtalo de nuevo.";
      
      addToast({
        title: "Error al eliminar cliente",
        description: errorMessage,
        color: "danger",
      });
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
      <section className="flex flex-col gap-4">
        <div className="inline-block max-w-lg text-center justify-center">
          <div className="flex items-center gap-2 mb-4">
            <RiUserLine className="text-3xl text-primary" />
            <h1 className="text-3xl font-bold">Clientes</h1>
          </div>
        </div>

        <div className="max-w-7xl w-full px-4">
          {/* Top Content */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between gap-3 items-end">
              <Input
                isClearable
                className="w-full sm:max-w-[44%]"
                placeholder="Buscar por nombre, apellido o DNI..."
                startContent={<RiSearchLine className="text-default-400" />}
                value={search}
                onValueChange={setSearch}
              />
              <Button 
                color="primary" 
                startContent={<IoPersonAddOutline />}
                onPress={handleOpenCreateForm}
              >
                Crear Cliente
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-default-400 text-small">
                Total {data?.pages[0]?.total || 0} clientes
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-content1 border border-default-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-default-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-default-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-content1 divide-y divide-default-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <Spinner classNames={{label: "text-foreground mt-4"}} label="Cargando clientes..." variant="wave" />
                      </td>
                    </tr>
                  ) : clients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-default-500">
                        No se encontraron clientes
                      </td>
                    </tr>
                  ) : (
                    clients.map((client: Client, index: number) => (
                      <tr 
                        key={client.id} 
                        className="hover:bg-default-50 transition-colors"
                        ref={index === clients.length - 1 ? lastElementRef : null}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-default-900">
                            {client.name} {client.lastname}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-default-900">{client.dni}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Chip 
                            className="capitalize" 
                            color={statusColorMap[client.state?.id as keyof typeof statusColorMap] || "default"} 
                            size="sm" 
                            variant="flat"
                          >
                            {statusTextMap[client.state?.id as keyof typeof statusTextMap] || "Desconocido"}
                          </Chip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-2 justify-center">
                            <Tooltip content="Ver detalles">
                              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <RiEyeLine onClick={() => handleViewClient(client)} />
                              </span>
                            </Tooltip>
                            <Tooltip content="Editar">
                              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <RiEditLine onClick={() => handleEditClient(client)} />
                              </span>
                            </Tooltip>
                            <Tooltip content="Eliminar">
                              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                <RiDeleteBinLine onClick={() => handleDeleteClient(client)} />
                              </span>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Infinite Scroll Loading Indicator */}
            {isFetchingNextPage && (
              <div className="px-6 py-4 border-t border-default-200 text-center">
                <Spinner classNames={{label: "text-foreground mt-2"}} label="Cargando más clientes..." variant="wave" />
              </div>
            )}
          </div>
        </div>

        {/* Client Form Modal */}
        <ClientForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
          initialData={editingClient || undefined}
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
          submitText={editingClient ? "Actualizar Cliente" : "Crear Cliente"}
          isLoading={isSubmitting}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Eliminar Cliente"
          message={`¿Estás seguro de que quieres eliminar a ${deletingClient?.name} ${deletingClient?.lastname}?

Esta acción eliminará permanentemente:
• Toda la información del cliente
• Todas las ventas asociadas
• Todos los pagos realizados
• Todas las cuotas pendientes
• Todas las notas relacionadas

Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isLoading={isDeleting}
        />
      </section>
    </DefaultLayout>
  );
} 