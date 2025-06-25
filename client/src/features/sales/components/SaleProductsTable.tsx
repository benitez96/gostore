import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { LiaEyeSolid, LiaEyeSlashSolid } from "react-icons/lia";

import { CurrencyDisplay } from "@/shared/components/ui";
import { calculateSubtotal } from "@/shared/utils/currency-utils";

export interface SaleProductsTableProps {
  products: any[];
  isCostVisible: boolean;
  onToggleCostVisibility: () => void;
}

export function SaleProductsTable({
  products,
  isCostVisible,
  onToggleCostVisibility,
}: SaleProductsTableProps) {
  const calculateTotalRevenue = () => {
    return products.reduce((total, product) => 
      total + calculateSubtotal(product.price, product.quantity), 0
    );
  };

  const calculateTotalCost = () => {
    return products.reduce((total, product) => 
      total + calculateSubtotal(product.cost, product.quantity), 0
    );
  };

  const calculateProfit = () => {
    return calculateTotalRevenue() - calculateTotalCost();
  };

  // Define columns based on visibility
  const columns = [
    { key: "name", label: "Producto" },
    { key: "quantity", label: "Cantidad" },
    { key: "price", label: "Precio Unit." },
    ...(isCostVisible ? [{ key: "cost", label: "Costo Unit." }] : []),
    { key: "subtotal", label: "Subtotal" },
    ...(isCostVisible ? [{ key: "profit", label: "Ganancia Unit." }] : []),
  ];

  const renderCell = (product: any, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return <div className="font-medium">{product.name}</div>;
      case "quantity":
        return <span className="font-mono">{product.quantity}</span>;
      case "price":
        return <CurrencyDisplay amount={product.price} />;
      case "cost":
        return <CurrencyDisplay amount={product.cost} />;
      case "subtotal":
        return (
          <CurrencyDisplay 
            amount={calculateSubtotal(product.price, product.quantity)}
            className="font-semibold"
          />
        );
      case "profit":
        return (
          <CurrencyDisplay 
            amount={(product.price - product.cost) * product.quantity}
            showSign
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Productos</h3>
        <Tooltip content={isCostVisible ? "Ocultar costos" : "Mostrar costos"}>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onToggleCostVisibility}
          >
            {isCostVisible ? <LiaEyeSlashSolid /> : <LiaEyeSolid />}
          </Button>
        </Tooltip>
      </div>

      <Table aria-label="Productos de la venta">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={products}>
          {(product) => (
            <TableRow key={product.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(product, columnKey as string)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Summary */}
      <div className="bg-default-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-default-600">Total Items</p>
            <p className="font-semibold">
              {products.reduce((total, product) => total + product.quantity, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-default-600">Ingresos Totales</p>
            <CurrencyDisplay amount={calculateTotalRevenue()} className="font-semibold" />
          </div>
          {isCostVisible && (
            <>
              <div>
                <p className="text-sm text-default-600">Costos Totales</p>
                <CurrencyDisplay amount={calculateTotalCost()} className="font-semibold" />
              </div>
              <div>
                <p className="text-sm text-default-600">Ganancia Total</p>
                <CurrencyDisplay amount={calculateProfit()} showSign className="font-semibold" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 