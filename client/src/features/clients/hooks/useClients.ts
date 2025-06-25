import { useCallback, useState, useEffect } from "react";
import { useAsyncList, AsyncListLoadOptions } from "@react-stately/data";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { clientsApi, Client, ApiClientsResponse } from "@/api";
import { useToast } from "@/shared/hooks/useToast";
import { isCancelledRequest } from "@/shared/utils/api-utils";

export interface UseClientsOptions {
  searchFilter?: string;
  statusFilter?: Set<string>;
  limit?: number;
}

export const useClients = ({
  searchFilter = "",
  statusFilter = new Set(["1", "2", "3"]),
  limit = 10,
}: UseClientsOptions = {}) => {
  const { showApiError } = useToast();
  const [totalClients, setTotalClients] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFilter);

  const loadClients = useCallback(
    async ({
      signal,
      cursor,
      filterText,
    }: AsyncListLoadOptions<Client, string>) => {
      try {
        const page = cursor ? parseInt(cursor, 10) : 1;
        const offset = (page - 1) * limit;

        // Convert status filter to array of numbers
        let stateIds: number[] = [];
        if (statusFilter.size > 0 && statusFilter.size < 3) {
          stateIds = Array.from(statusFilter).map(Number);
        }

        const params = {
          offset,
          limit,
          search: filterText || debouncedSearch,
          states: stateIds.length > 0 ? stateIds : undefined,
          signal,
        };

        const response: ApiClientsResponse = await clientsApi.getAll(params);

        setHasMore(response.count > page * limit);
        setTotalClients(response.count);

        return {
          items: response.results || [],
          cursor: response.count > page * limit ? (page + 1).toString() : undefined,
        };
      } catch (error) {
        if (isCancelledRequest(error)) {
          return { items: [], cursor: undefined };
        }

        console.error("Error loading clients:", error);
        showApiError("Error al cargar clientes", error);

        return {
          items: [],
          cursor: undefined,
        };
      }
    },
    [limit, statusFilter, debouncedSearch, showApiError],
  );

  const list = useAsyncList<Client>({
    load: loadClients,
    getKey: (item: Client) => item.id.toString(),
  });

  // Debounce search filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchFilter);
      list.setFilterText(searchFilter);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchFilter]);

  // Trigger reload when status filter changes
  useEffect(() => {
    list.reload();
  }, [statusFilter]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore,
  });

  return {
    items: list.items,
    isLoading: list.isLoading,
    hasMore,
    totalClients,
    loadMore: list.loadMore,
    reload: list.reload,
    loaderRef: loaderRef as React.RefObject<HTMLDivElement>,
    scrollerRef: scrollerRef as React.RefObject<HTMLDivElement>,
  };
}; 