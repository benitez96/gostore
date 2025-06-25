import React from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, TableColumn, createViewAction, createEditAction, createDeleteAction } from "@/shared/components/ui";
import { StatusChip } from "@/shared/components/ui";
import { Client } from "@/api";

export interface ClientsTableProps {
  clients: Client[];
  isLoading?: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  bottomContent?: React.ReactNode;
  topContent?: React.ReactNode;
}

export function ClientsTable({
  clients,
  isLoading = false,
  onEdit,
  onDelete,
  bottomContent,
  topContent,
}: ClientsTableProps) {
  const navigate = useNavigate();

  const handleView = (client: Client) => {
    navigate(`/cliente/${client.id}`);
  };

  const columns: TableColumn<Client>[] = [
    {
      key: "name",
      label: "Nombre",
      sortable: true,
      render: (client: Client) => (
        <div className="flex flex-col">
          <p className="text-bold text-sm capitalize">
            {client.name} {client.lastname}
          </p>
          <p className="text-bold text-sm capitalize text-default-400">
            DNI: {client.dni}
          </p>
        </div>
      ),
    },
    {
      key: "dni",
      label: "DNI",
      render: (client: Client) => (
        <p className="text-sm font-mono">{client.dni}</p>
      ),
    },
    {
      key: "state",
      label: "Estado",
      render: (client: Client) => (
        <StatusChip status={client.state?.id || 1} type="client" />
      ),
    },
    {
      key: "id",
      label: "ID",
      render: (client: Client) => (
        <span className="text-sm font-mono text-default-500">
          #{client.id}
        </span>
      ),
    },
  ];

  const actions = [
    createViewAction(handleView),
    createEditAction(onEdit),
    createDeleteAction(onDelete),
  ];

  return (
    <DataTable
      data={clients}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      emptyContent="No se encontraron clientes"
      getRowKey={(client) => client.id.toString()}
      topContent={topContent}
      bottomContent={bottomContent}
    />
  );
} 