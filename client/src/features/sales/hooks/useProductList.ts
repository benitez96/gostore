import { useState, useEffect } from "react";
import { Product, Paginated } from "@/types";
import { tokenManager } from "@/api";

interface UseProductListOptions {
  searchTerm?: string;
  fetchDelay?: number;
}

interface UseProductListReturn {
  items: Product[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function useProductList({ searchTerm = "", fetchDelay = 300 }: UseProductListOptions = {}): UseProductListReturn {
  const [items, setItems] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20; // Number of items per page, adjust as necessary

  const loadProducts = async (currentOffset: number, search: string) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      setIsLoading(true);

      if (currentOffset > 0) {
        // Delay to simulate network latency and avoid excessive requests
        await new Promise((resolve) => setTimeout(resolve, fetchDelay));
      }

      const url = new URL('/api/products', import.meta.env.VITE_API_URL ||window.location.origin);
      url.searchParams.set('offset', currentOffset.toString());
      url.searchParams.set('limit', limit.toString());
      if (search) {
        url.searchParams.set('search', search);
      }

      // Preparar cabeceras de autenticación
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const token = tokenManager.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url.toString(), { 
        signal,
        headers 
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const json: Paginated<Product> = await res.json();

      setHasMore(currentOffset + json.results.length < json.count);
      
      if (currentOffset === 0) {
        // Reset items for new search
        setItems(json.results);
      } else {
        // Append new results to existing ones
        setItems((prevItems) => [...prevItems, ...json.results]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
      } else {
        console.error("There was an error with the fetch operation:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset and load when search term changes
  useEffect(() => {
    setOffset(0);
    setItems([]);
    setHasMore(true);
    loadProducts(0, searchTerm);
  }, [searchTerm]);

  const onLoadMore = () => {
    if (!hasMore || isLoading) return;
    
    const newOffset = offset + limit;
    setOffset(newOffset);
    loadProducts(newOffset, searchTerm);
  };

  return {
    items,
    hasMore,
    isLoading,
    onLoadMore,
  };
} 
