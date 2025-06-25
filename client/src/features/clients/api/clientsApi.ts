import { clientsApi as mainClientsApi } from "@/api";
import { PaginationParams } from "@/shared/utils";

// Re-export types from main API
export type { Client, ClientDetail, ApiClientsResponse } from "@/api";

// Extended params interface for feature-specific needs
export interface ClientsQueryParams extends PaginationParams {
  signal?: AbortSignal;
}

// Transform our pagination params to the main API params format
const transformParams = (params: ClientsQueryParams) => ({
  limit: params.limit,
  offset: params.offset,
  search: params.search,
  states: params.states,
  signal: params.signal,
});

// Re-export the main clients API with our parameter transformation
export const clientsApi = {
  async getAll(params: ClientsQueryParams = {}) {
    return mainClientsApi.getAll(transformParams(params));
  },
  
  async getById(id: string) {
    return mainClientsApi.getById(parseInt(id));
  },
  
  async create(data: any) {
    return mainClientsApi.create(data);
  },
  
  async update(id: string, data: any) {
    return mainClientsApi.update(parseInt(id), data);
  },
  
  async delete(id: string) {
    return mainClientsApi.delete(parseInt(id));
  },
}; 