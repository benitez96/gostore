import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { RiEyeLine, RiEditLine, RiDeleteBinLine } from "react-icons/ri";

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T, column: TableColumn<T>) => React.ReactNode;
  width?: number;
  align?: "start" | "center" | "end";
}

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  onAction: (item: T) => void;
  isVisible?: (item: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  emptyContent?: string;
  actions?: TableAction<T>[];
  onRowAction?: (item: T) => void;
  getRowKey: (item: T) => string | number;
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  sortDescriptor?: {
    column: string;
    direction: "ascending" | "descending";
  };
  onSortChange?: (descriptor: { column: string; direction: "ascending" | "descending" }) => void;
  bottomContent?: React.ReactNode;
  topContent?: React.ReactNode;
  classNames?: {
    table?: string;
    th?: string;
    td?: string;
    tr?: string;
  };
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyContent = "No hay datos disponibles",
  actions = [],
  onRowAction,
  getRowKey,
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
  sortDescriptor,
  onSortChange,
  bottomContent,
  topContent,
  classNames,
}: DataTableProps<T>) {
  const renderCell = (item: T, columnKey: React.Key) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column) return null;

    if (column.render) {
      return column.render(item, column);
    }

    // Default rendering based on the key
    const value = (item as any)[String(columnKey)];
    
    if (value === null || value === undefined) {
      return <span className="text-default-400">-</span>;
    }

    if (typeof value === "boolean") {
      return (
        <Chip
          color={value ? "success" : "danger"}
          size="sm"
          variant="flat"
        >
          {value ? "Sí" : "No"}
        </Chip>
      );
    }

    if (typeof value === "number") {
      return <span className="text-default-900 font-medium">{value}</span>;
    }

    return <span className="text-default-900">{String(value)}</span>;
  };

  const renderActions = (item: T) => {
    if (actions.length === 0) return null;

    const visibleActions = actions.filter(action => 
      !action.isVisible || action.isVisible(item)
    );

    if (visibleActions.length === 0) return null;

    return (
      <div className="relative flex items-center gap-1">
        {visibleActions.map((action, index) => (
          <Tooltip key={index} content={action.label}>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color={action.color || "default"}
              onPress={() => action.onAction(item)}
            >
              {action.icon}
            </Button>
          </Tooltip>
        ))}
      </div>
    );
  };

  // Add actions column if there are actions
  const actionsColumn: TableColumn<T> = {
    key: "actions",
    label: "Acciones",
    width: 100,
    sortable: false,
  };
  
  const columnsWithActions = actions.length > 0 
    ? [...columns, actionsColumn]
    : columns;

  return (
    <Table
      aria-label="Tabla de datos"
      selectionMode={selectionMode}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange as any}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange as any}
      topContent={topContent}
      bottomContent={bottomContent}
      classNames={classNames}
    >
      <TableHeader columns={columnsWithActions}>
        {(column) => (
          <TableColumn
            key={column.key}
            allowsSorting={column.sortable || false}
            width={column.width as any}
            align={column.align}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={data}
        isLoading={isLoading}
        emptyContent={emptyContent}
        loadingContent={<Spinner label="Cargando..." />}
      >
        {(item) => (
          <TableRow
            key={getRowKey(item)}
            className="cursor-pointer hover:bg-default-50"
            onClick={onRowAction ? () => onRowAction(item) : undefined}
          >
            {(columnKey) => (
              <TableCell>
                {columnKey === "actions" 
                  ? renderActions(item)
                  : renderCell(item, columnKey)
                }
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// Predefined common actions
export const createViewAction = <T,>(onView: (item: T) => void): TableAction<T> => ({
  label: "Ver",
  icon: <RiEyeLine />,
  color: "primary",
  onAction: onView,
});

export const createEditAction = <T,>(onEdit: (item: T) => void): TableAction<T> => ({
  label: "Editar",
  icon: <RiEditLine />,
  color: "secondary",
  onAction: onEdit,
});

export const createDeleteAction = <T,>(onDelete: (item: T) => void): TableAction<T> => ({
  label: "Eliminar",
  icon: <RiDeleteBinLine />,
  color: "danger",
  onAction: onDelete,
}); 