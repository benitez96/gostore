import { Accordion, AccordionItem } from "@heroui/accordion";
import {
  RiShoppingBagLine,
  RiInformationLine,
  RiMoneyDollarCircleLine,
  RiStockLine,
  RiCalendarLine,
} from "react-icons/ri";

import { formatCurrency } from "@/shared/utils/formatters";

import { ProductStats as ProductStatsType } from "../hooks/useProductStats";

interface ProductStatsProps {
  productStats?: ProductStatsType;
  isLoading: boolean;
}

export function ProductStats({ productStats, isLoading }: ProductStatsProps) {
  return (
    <div className="mt-6">
      <Accordion className="gap-2 px-0" variant="splitted">
        <AccordionItem
          key="stats"
          aria-label="Estadísticas de productos"
          title={
            <div className="flex items-center gap-2">
              <RiInformationLine className="text-primary" />
              <span>Estadísticas del catálogo</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiShoppingBagLine className="text-2xl text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {isLoading ? "..." : productStats?.total_products || 0}
              </p>
              <p className="text-sm text-default-500">Total productos</p>
            </div>

            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiMoneyDollarCircleLine className="text-2xl text-danger mx-auto mb-2" />
              <p className="text-2xl font-bold text-danger">
                {isLoading
                  ? "..."
                  : formatCurrency(productStats?.total_cost || 0)}
              </p>
              <p className="text-sm text-default-500">Costo total</p>
            </div>

            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiMoneyDollarCircleLine className="text-2xl text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">
                {isLoading
                  ? "..."
                  : formatCurrency(productStats?.total_value || 0)}
              </p>
              <p className="text-sm text-default-500">Valor total</p>
            </div>

            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiStockLine className="text-2xl text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-warning">
                {isLoading ? "..." : productStats?.total_stock || 0}
              </p>
              <p className="text-sm text-default-500">Stock total</p>
            </div>

            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiCalendarLine className="text-2xl text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-secondary">
                {isLoading ? "..." : productStats?.out_of_stock_count || 0}
              </p>
              <p className="text-sm text-default-500">Sin stock</p>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
} 