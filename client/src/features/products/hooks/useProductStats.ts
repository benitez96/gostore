import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useCatalogStatsShortcut } from "@/hooks/useShortcut";
import { api } from "@/api";

export interface ProductStatsData {
  total_products: number;
  total_cost: number;
  total_value: number;
  total_stock: number;
  out_of_stock_count: number;
}

export const useProductStats = () => {
  const [showStats, setShowStats] = useState(false);

  // Hook para el shortcut de estadísticas del catálogo
  useCatalogStatsShortcut(() => {
    setShowStats((prev) => !prev);
  });

  // Query para obtener estadísticas de productos
  const { data: productStats, isLoading: statsLoading } =
    useQuery<ProductStatsData>({
      queryKey: ["product-stats"],
      queryFn: async () => {
        const response = await api.get("/api/products-stats");
        return response.data;
      },
    });

  return {
    showStats,
    productStats,
    statsLoading,
    setShowStats,
  };
}; 