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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4">
            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiShoppingBagLine className="text-2xl text-primary mx-auto mb-2" />
              <div className="h-16 flex items-center justify-center">
                <p className="text-2xl font-bold text-balance">
                  {isLoading ? "..." : productStats?.total_products || 0}
                </p>
              </div>
              <p className="text-sm text-default-500">Total productos</p>
            </div>

            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiMoneyDollarCircleLine className="text-2xl text-primary mx-auto mb-2" />
              <div className="h-16 flex items-center justify-center">
                <p className="text-lg font-bold text-primary text-balance break-all">
                  {isLoading
                    ? "..."
                    : formatCurrency(productStats?.total_cost || 0)}
                </p>
              </div>
              <p className="text-sm text-default-500">Costo total</p>
            </div>

            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiMoneyDollarCircleLine className="text-2xl text-success mx-auto mb-2" />
              <div className="h-16 flex items-center justify-center">
                <p className="text-lg font-bold text-success text-balance break-all">
                  {isLoading
                    ? "..."
                    : formatCurrency(productStats?.total_value || 0)}
                </p>
              </div>
              <p className="text-sm text-default-500">Valor total</p>
            </div>

            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiStockLine className="text-2xl text-warning mx-auto mb-2" />
              <div className="h-16 flex items-center justify-center">
                <p className="text-2xl font-bold text-warning text-balance">
                  {isLoading ? "..." : productStats?.total_stock || 0}
                </p>
              </div>
              <p className="text-sm text-default-500">Stock total</p>
            </div>

            <div className="bg-default-50 rounded-lg p-4 text-center">
              <RiCalendarLine className="text-2xl text-secondary mx-auto mb-2" />
              <div className="h-16 flex items-center justify-center">
                <p className="text-2xl font-bold text-secondary text-balance">
                  {isLoading ? "..." : productStats?.out_of_stock_count || 0}
                </p>
              </div>
              <p className="text-sm text-default-500">Sin stock</p>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
} 