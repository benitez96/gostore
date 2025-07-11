import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/components/AuthProvider";
import { api } from "@/api";

export interface ProductStatsData {
  total_products: number;
  total_cost: number;
  total_value: number;
  total_stock: number;
  out_of_stock_count: number;
}

export const useProductStats = () => {
  const { canAccessDashboard } = useAuthContext();

  // Query para obtener estadísticas de productos
  const { data: productStats, isLoading: statsLoading } =
    useQuery<ProductStatsData>({
      queryKey: ["product-stats"],
      queryFn: async () => {
        const response = await api.get("/api/products-stats");
        return response.data;
      },
      // Solo ejecutar la query si el usuario tiene permisos de dashboard
      enabled: canAccessDashboard(),
    });

  // Mostrar estadísticas si el usuario tiene permisos de dashboard
  const showStats = canAccessDashboard();

  return {
    showStats,
    productStats,
    statsLoading,
  };
}; 