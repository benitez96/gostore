import { useState, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAsyncList, AsyncListLoadOptions } from "@react-stately/data";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import axios from "axios";

import { api } from "@/api";
import { useToast } from "@/shared/hooks/useToast";
import { Product } from "@/types";
import { ProductFormData } from "../components/ProductForm";
import { StockUpdateData } from "../components/StockUpdateModal";

export function useProducts() {
  const queryClient = useQueryClient();
  const { showSuccess, showApiError } = useToast();
  
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const loadProducts = useCallback(
    async ({
      signal,
      cursor,
      filterText,
    }: AsyncListLoadOptions<Product, string>) => {
      try {
        const page = cursor ? parseInt(cursor, 10) : 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const response = await api.get("/api/products", {
          params: {
            offset,
            limit,
            search: filterText,
          },
          signal,
        });

        // Handle both paginated and non-paginated responses
        let products: Product[];
        let count: number;

        if (response.data.results) {
          // Paginated response
          products = response.data.results || [];
          count = response.data.count || 0;
        } else {
          // Non-paginated response (fallback)
          products = Array.isArray(response.data) ? response.data : [];
          count = products.length;
        }

        setHasMore(count > page * limit);
        setTotalProducts(count);

        return {
          items: products,
          cursor: count > page * limit ? (page + 1).toString() : undefined,
        };
      } catch (error) {
        if (axios.isCancel(error)) {
          return { items: [], cursor: undefined };
        }

        console.error("Error loading products:", error);
        return {
          items: [],
          cursor: undefined,
        };
      } finally {
        if (!cursor) {
          setIsLoading(false);
        }
      }
    },
    [] // Sin dependencias para evitar bucles infinitos
  );

  const list = useAsyncList<Product>({
    load: loadProducts,
    getKey: (item: Product) => item.id,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      list.setFilterText(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore,
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const response = await api.post("/api/products", productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      list.reload();
      showSuccess("Producto creado", "El producto se ha creado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error creating product:", error);
      showApiError("Error al crear producto", "No se pudo crear el producto. Inténtalo de nuevo.");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      productData,
    }: {
      id: string;
      productData: ProductFormData;
    }) => {
      const response = await api.put(`/api/products/${id}`, productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      list.reload();
      showSuccess("Producto actualizado", "El producto se ha actualizado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error updating product:", error);
      showApiError("Error al actualizar producto", "No se pudo actualizar el producto. Inténtalo de nuevo.");
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({
      id,
      stockData,
      product,
    }: {
      id: string;
      stockData: StockUpdateData;
      product: Product;
    }) => {
      const updatedProductData = {
        name: product.name,
        cost: product.cost,
        price: product.price,
        stock: stockData.stock,
      };

      const response = await api.put(`/api/products/${id}`, updatedProductData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      list.reload();
      showSuccess("Stock actualizado", "El stock se ha actualizado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error updating stock:", error);
      showApiError("Error al actualizar stock", "No se pudo actualizar el stock. Inténtalo de nuevo.");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      list.reload();
      showSuccess("Producto eliminado", "El producto se ha eliminado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error deleting product:", error);
      showApiError("Error al eliminar producto", "No se pudo eliminar el producto. Inténtalo de nuevo.");
    },
  });

  return {
    // State
    search,
    setSearch,
    isLoading,
    hasMore,
    totalProducts,
    items: list.items,
    
    // Refs
    loaderRef: loaderRef as React.RefObject<HTMLDivElement>,
    scrollerRef: scrollerRef as React.RefObject<HTMLDivElement>,
    
    // Actions (devolver las mutaciones completas)
    createProduct: createProductMutation,
    updateProduct: updateProductMutation,
    updateStock: updateStockMutation,
    deleteProduct: deleteProductMutation,
    
    // Loading states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isUpdatingStock: updateStockMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
  };
} 