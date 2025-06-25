import { Button } from "@heroui/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { LiaEyeSolid, LiaEyeSlashSolid } from "react-icons/lia";

import { CurrencyDisplay } from "@/shared/components/ui";

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
  return (
    <Table aria-label="Productos de la venta">
      <TableHeader>
        <TableColumn>Producto</TableColumn>
        <TableColumn>Cantidad</TableColumn>
        <TableColumn>
          <div className="flex items-center gap-1">
            <span>Costo</span>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={onToggleCostVisibility}
            >
              {isCostVisible ? <LiaEyeSlashSolid /> : <LiaEyeSolid />}
            </Button>
          </div>
        </TableColumn>
        <TableColumn>Precio unitario</TableColumn>
        <TableColumn>Subtotal</TableColumn>
      </TableHeader>
      <TableBody>
        {products.map((product: any) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.quantity}</TableCell>
            <TableCell>
              {isCostVisible ? (
                <CurrencyDisplay amount={product.cost || 0} />
              ) : (
                <span className="text-default-400">••••</span>
              )}
            </TableCell>
            <TableCell>
              <CurrencyDisplay amount={product.price} />
            </TableCell>
            <TableCell>
              <CurrencyDisplay amount={product.price * product.quantity} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 