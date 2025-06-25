import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Spinner } from "@heroui/spinner";
import { RiEditLine, RiDeleteBinLine, RiRefreshLine } from "react-icons/ri";

import { Product } from "@/types";
import { formatCurrency } from "@/shared/utils/formatters";
import { DateDisplay } from "@/shared/components/ui";

export interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  loaderRef: React.RefObject<HTMLDivElement>;
  scrollerRef: React.RefObject<HTMLDivElement>;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onUpdateStock: (product: Product) => void;
}

const columns = [
  { name: "PRODUCTO", uid: "name" },
  { name: "STOCK", uid: "stock" },
  { name: "COSTO", uid: "cost" },
  { name: "PRECIO", uid: "price" },
  { name: "MARGEN", uid: "margin" },
  { name: "ULT. ACTUALIZADO", uid: "updated_at" },
  { name: "ACCIONES", uid: "actions" },
];

export function ProductsTable({
  products,
  isLoading,
  hasMore,
  loaderRef,
  scrollerRef,
  onEditProduct,
  onDeleteProduct,
  onUpdateStock,
}: ProductsTableProps) {
  
  const getStockColor = (stock: number) => {
    if (stock === 0) return "warning";
    return "success";
  };

  const renderCell = (product: Product, columnKey: React.Key) => {
    const cellValue = product[columnKey as keyof Product];

    switch (columnKey) {
      case "name":
        return (
          <div className="text-sm font-medium text-default-900">
            {product.name}
          </div>
        );
      case "stock":
        return (
          <Chip
            color={getStockColor(product.stock)}
            size="sm"
            variant="flat"
          >
            {product.stock} unidades
          </Chip>
        );
      case "cost":
        return (
          <div className="text-sm text-default-600">
            {formatCurrency(product.cost)}
          </div>
        );
      case "price":
        return (
          <div className="text-sm text-default-900">
            {formatCurrency(product.price)}
          </div>
        );
      case "margin":
        const profit = product.price - product.cost;
        const marginPercent = product.cost > 0 
          ? ((profit / product.price) * 100).toFixed(1)
          : '0';
        
        return (
          <div className="flex flex-col">
            <div className={`text-sm font-medium ${profit >= 0 ? "text-success" : "text-danger"}`}>
              {formatCurrency(profit)}
            </div>
            <span className="text-tiny text-default-400">
              {marginPercent}%
            </span>
          </div>
        );
      case "updated_at":
        return (
          <DateDisplay 
            date={product.updated_at}
            className="text-default-500 text-sm"
          />
        );
      case "actions":
        return (
          <div className="flex gap-2 justify-center">
            <Tooltip content="Actualizar stock">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <RiRefreshLine onClick={() => onUpdateStock(product)} />
              </span>
            </Tooltip>
            <Tooltip content="Editar">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <RiEditLine onClick={() => onEditProduct(product)} />
              </span>
            </Tooltip>
            <Tooltip content="Eliminar">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <RiDeleteBinLine onClick={() => onDeleteProduct(product)} />
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
      aria-label="Tabla de productos"
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
        emptyContent="No se encontraron productos"
        isLoading={isLoading}
        items={products}
        loadingContent={
          <Spinner
            classNames={{ label: "text-foreground mt-4" }}
            variant="wave"
          />
        }
      >
        {(item: Product) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 