import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiUserLine,
  RiSearchLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { IoPersonAddOutline } from "react-icons/io5";
import { LiaUserEditSolid } from "react-icons/lia";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Tooltip } from "@heroui/tooltip";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { useAsyncList, AsyncListLoadOptions } from "@react-stately/data";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { addToast } from "@heroui/toast";
import axios from "axios";

import { Client, ClientDetail, clientsApi, ApiClientsResponse } from "@/api";
import ClientForm from "@/components/ClientForm";
import ConfirmModal from "@/components/ConfirmModal";
import DefaultLayout from "@/layouts/default";

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
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDetail | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalClients, setTotalClients] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const loadClients = useCallback(
    async ({
      signal,
      cursor,
      filterText,
    }: AsyncListLoadOptions<Client, string>) => {
      // When loading more, the top-level isLoading should be false
      setIsLoading(!cursor);

      try {
        const page = cursor ? parseInt(cursor, 10) : 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const response: ApiClientsResponse = await clientsApi.getAll({
          offset,
          limit,
          search: filterText,
          signal,
        });

        setHasMore(response.count > page * limit);
        setTotalClients(response.count);

        return {
          items: response.results || [],
          cursor:
            response.count > page * limit ? (page + 1).toString() : undefined,
        };
      } catch (error) {
        if (axios.isCancel(error)) {
          // Request was canceled

          // This part is tricky, returning previous state might be complex.
          // For now, returning an empty list on cancel is safer.
          return { items: [], cursor: undefined };
        }

        console.error("Error loading clients:", error);
        addToast({
          title: "Error al cargar clientes",
          description:
            "No se pudieron cargar los clientes. Inténtalo de nuevo.",
          color: "danger",
        });

        return {
          items: [],
          cursor: undefined,
        };
      } finally {
        // Ensure loading is always false when done, for both success and error
        if (!cursor) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  // Use AsyncList for infinite scroll with HeroUI Table
  const list = useAsyncList<Client>({
    load: loadClients,
    getKey: (item: Client) => item.id,
  });

  // Debounce search text to update the list
  useEffect(() => {
    const timer = setTimeout(() => {
      list.setFilterText(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore,
  });

  const handleCreateClient = async (clientData: Omit<ClientDetail, "id">) => {
    setIsSubmitting(true);
    try {
      await clientsApi.create(clientData);
      // Reload the list
      list.reload();

      addToast({
        title: "Cliente creado",
        description: "El cliente se ha creado exitosamente",
        color: "success",
      });
    } catch (error: any) {
      console.error("Error creating client:", error);

      // Extract error message from API response
      const errorMessage =
        error.response?.data?.msg ||
        error.message ||
        "No se pudo crear el cliente. Inténtalo de nuevo.";

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

  const handleUpdateClient = async (clientData: Omit<ClientDetail, "id">) => {
    if (!editingClient) return;

    setIsSubmitting(true);
    try {
      await clientsApi.update(editingClient.id, clientData);
      // Reload the list
      list.reload();

      addToast({
        title: "Cliente actualizado",
        description: "El cliente se ha actualizado exitosamente",
        color: "success",
      });
    } catch (error: any) {
      console.error("Error updating client:", error);

      // Extract error message from API response
      const errorMessage =
        error.response?.data?.msg ||
        error.message ||
        "No se pudo actualizar el cliente. Inténtalo de nuevo.";

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
      const errorMessage =
        error.response?.data?.msg ||
        error.message ||
        "No se pudieron cargar los datos del cliente.";

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
      // Reload the list
      list.reload();

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
      const errorMessage =
        error.response?.data?.msg ||
        error.message ||
        "No se pudo eliminar el cliente. Inténtalo de nuevo.";

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

  const columns = [
    { name: "NOMBRE", uid: "name" },
    { name: "DNI", uid: "dni" },
    { name: "ESTADO", uid: "state" },
    { name: "ACCIONES", uid: "actions" },
  ];

  const renderCell = useCallback((client: Client, columnKey: React.Key) => {
    const cellValue = client[columnKey as keyof Client];

    switch (columnKey) {
      case "name":
        return (
          <div className="text-sm font-medium text-default-900">
            {client.name} {client.lastname}
          </div>
        );
      case "dni":
        return <div className="text-sm text-default-900">{client.dni}</div>;
      case "state":
        return (
          <Chip
            className="capitalize"
            color={
              statusColorMap[client.state?.id as keyof typeof statusColorMap] ||
              "default"
            }
            size="sm"
            variant="flat"
          >
            {statusTextMap[client.state?.id as keyof typeof statusTextMap] ||
              "Desconocido"}
          </Chip>
        );
      case "actions":
        return (
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
        );
      default:
        return typeof cellValue === "object" ? "" : cellValue;
    }
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6">
        {/* Header con título y botón de refresh */}
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
        </div>

        <div className="max-w-7xl w-full px-4">
          {/* Top Content */}
          <div className="flex justify-between">
            <div className="flex flex-col gap-4 mb-6 w-full">
              <div className="flex justify-between gap-3 items-end">
                <Input
                  isClearable
                  className="w-full sm:max-w-[44%]"
                  placeholder="Buscar por nombre, apellido o DNI..."
                  startContent={<RiSearchLine className="text-default-400" />}
                  value={search}
                  onValueChange={setSearch}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-400 text-small">
                  Total {totalClients} clientes
                </span>
              </div>
            </div>
            <div className="flex justify-end items-end pb-6">
              <Button
                className="font-medium w-full sm:w-auto"
                color="primary"
                startContent={<IoPersonAddOutline />}
                variant="flat"
                onPress={handleOpenCreateForm}
              >
                Crear Cliente
              </Button>
            </div>
          </div>

          {/* HeroUI Table with Infinite Scroll */}
          <Table
            isHeaderSticky
            aria-label="Tabla de clientes"
            baseRef={scrollerRef}
            bottomContent={
              hasMore ? (
                <div className="flex w-full justify-center">
                  <Spinner
                    ref={loaderRef}
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                  />
                </div>
              ) : null
            }
            classNames={{
              base: "max-h-[calc(100dvh-250px)] overflow-hidden",
              td: "py-4",
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent="No se encontraron clientes"
              isLoading={isLoading}
              items={list.items}
              loadingContent={
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                />
              }
            >
              {(item: Client) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
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
          isLoading={isDeleting}
          isOpen={isDeleteModalOpen}
          message={`¿Estás seguro de que quieres eliminar a ${deletingClient?.name} ${deletingClient?.lastname}?

Esta acción eliminará permanentemente:
• Toda la información del cliente
• Todas las ventas asociadas
• Todos los pagos realizados
• Todas las cuotas pendientes
• Todas las notas relacionadas

Esta acción no se puede deshacer.`}
          title="Eliminar Cliente"
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </section>
    </DefaultLayout>
  );
}
