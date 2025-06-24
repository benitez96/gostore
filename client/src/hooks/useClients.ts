import { useInfiniteQuery } from "@tanstack/react-query";

import { clientsApi, ClientsResponse, ApiClientsResponse } from "@/api";

const fetchClients = async ({
  pageParam = 0,
  queryKey,
}: any): Promise<ClientsResponse> => {
  const [_, search] = queryKey;
  const limit = 10;
  const offset = pageParam * limit;

  const response: ApiClientsResponse = await clientsApi.getAll({
    limit,
    offset,
    search,
  });

  // Transform API response to expected format
  return {
    clients: response.results,
    total: response.count,
    hasMore: (pageParam + 1) * limit < response.count,
  };
};

export const useClients = (search: string = "") => {
  return useInfiniteQuery({
    queryKey: ["clients", search],
    queryFn: fetchClients,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.length;
      }

      return undefined;
    },
    initialPageParam: 0,
  });
};

// Re-export types for convenience
export type { Client, ClientsResponse } from "@/api";
