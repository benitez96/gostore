import React from "react";
import { useNavigate } from "react-router-dom";
import {
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { Tooltip } from "@heroui/tooltip";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

import { Client } from "@/api";
import { statusColorMap, statusTextMap } from "@/shared/utils/constants";

export interface ClientsTableProps {
  clients: Client[];
  isLoading?: boolean;
  hasMore?: boolean;
  loaderRef?: React.RefObject<HTMLDivElement>;
  scrollerRef?: React.RefObject<HTMLDivElement>;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onView?: (client: Client) => void;
}

export function ClientsTable({
  clients,
  isLoading = false,
  hasMore = false,
  loaderRef,
  scrollerRef,
  onEdit,
  onDelete,
  onView,
}: ClientsTableProps) {
  const navigate = useNavigate();

  const handleViewClient = (client: Client) => {
    if (onView) {
      onView(client);
    } else {
      navigate(`/clientes/${client.id}`);
    }
  };

  const columns = [
    { name: "NOMBRE", uid: "name" },
    { name: "DNI", uid: "dni" },
    { name: "ESTADO", uid: "state" },
    { name: "ACCIONES", uid: "actions" },
  ];

  const renderCell = (client: Client, columnKey: React.Key) => {
    const cellValue = client[columnKey as keyof Client];

    switch (columnKey) {
      case "name":
        return (
          <div className="text-sm font-medium text-default-900">
            {client.lastname} {client.name} 
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
          <div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
            <Tooltip content="Ver detalles">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <RiEyeLine onClick={() => handleViewClient(client)} />
              </span>
            </Tooltip>
            <Tooltip content="Editar">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <RiEditLine onClick={() => onEdit(client)} />
              </span>
            </Tooltip>
            <Tooltip content="Eliminar">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <RiDeleteBinLine onClick={() => onDelete(client)} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return typeof cellValue === "object" ? "" : cellValue;
    }
  };

  return (
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
        items={clients}
        loadingContent={
          <Spinner
            classNames={{ label: "text-foreground mt-4" }}
            variant="wave"
          />
        }
      >
        {(item: Client) => (
          <TableRow 
            key={item.id}
            className="cursor-pointer hover:bg-default-50 transition-colors"
            onClick={() => handleViewClient(item)}
          >
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 