import React, { useCallback } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Spinner } from "@heroui/spinner";
import { RiEditLine, RiDeleteBinLine, RiRefreshLine, RiShoppingBagLine } from "react-icons/ri";

import { Product } from "@/types";
import { CurrencyDisplay, DateDisplay } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/feedback";

export interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  loaderRef: React.RefObject<HTMLDivElement>;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onUpdateStock: (product: Product) => void;
}

const columns = [
  { name: "PRODUCTO", uid: "name" },
  { name: "COSTO", uid: "cost" },
  { name: "PRECIO", uid: "price" },
  { name: "STOCK", uid: "stock" },
  { name: "MARGEN", uid: "margin" },
  { name: "ACTUALIZADO", uid: "updated_at" },
  { name: "ACCIONES", uid: "actions" },
];

export function ProductsTable({
  products,
  isLoading,
  hasMore,
  loaderRef,
  onEditProduct,
  onDeleteProduct,
  onUpdateStock,
}: ProductsTableProps) {
  const renderCell = useCallback((product: Product, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold">{product.name}</p>
            <p className="text-tiny capitalize text-default-400">
              ID: {product.id}
            </p>
          </div>
        );
      case "cost":
        return (
          <CurrencyDisplay 
            amount={product.cost} 
            className="text-default-600"
          />
        );
      case "price":
        return (
          <CurrencyDisplay 
            amount={product.price} 
            className="font-medium"
          />
        );
      case "stock":
        return (
          <Chip
            color={
              product.stock > 10
                ? "success"
                : product.stock > 0
                  ? "warning"
                  : "danger"
            }
            size="sm"
            variant="flat"
          >
            {product.stock} unidades
          </Chip>
        );
      case "margin":
        const profit = product.price - product.cost;
        const marginPercent = product.cost > 0 
          ? ((profit / product.price) * 100).toFixed(1)
          : '0';
        
        return (
          <div className="flex flex-col">
            <CurrencyDisplay
              amount={profit}
              className={`font-medium ${profit >= 0 ? "text-success" : "text-danger"}`}
              showSign
            />
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
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onUpdateStock(product)}
              >
                <RiRefreshLine />
              </Button>
            </Tooltip>
            <Tooltip content="Editar">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onEditProduct(product)}
              >
                <RiEditLine />
              </Button>
            </Tooltip>
            <Tooltip content="Eliminar">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => onDeleteProduct(product)}
              >
                <RiDeleteBinLine />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return "";
    }
  }, [onEditProduct, onDeleteProduct, onUpdateStock]);

  return (
    <Table
      isHeaderSticky
      aria-label="Tabla de productos"
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
        emptyContent={
          <EmptyState
            title="No se encontraron productos"
            description="No hay productos que coincidan con tu búsqueda."
            icon={<RiShoppingBagLine className="text-4xl text-default-400" />}
          />
        }
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
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 