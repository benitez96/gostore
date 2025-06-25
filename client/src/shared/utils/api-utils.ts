import axios from "axios";

/**
 * API error handling utilities
 */

export const isAxiosError = (error: any): error is import('axios').AxiosError => {
  return axios.isAxiosError(error);
};

export const isCancelledRequest = (error: any): boolean => {
  return axios.isCancel(error);
};

export const getErrorMessage = (error: any): string => {
  if (isCancelledRequest(error)) {
    return "Operación cancelada";
  }
  
  if (isAxiosError(error)) {
    const responseData = error.response?.data as any;
    return responseData?.msg || 
           responseData?.message || 
           error.message || 
           "Ha ocurrido un error inesperado";
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "Ha ocurrido un error inesperado";
};

/**
 * Pagination utilities
 */
export interface PaginationParams {
  offset?: number;
  limit?: number;
  search?: string;
  states?: number[];
}

export const buildPaginationParams = (params: PaginationParams) => {
  const queryParams: Record<string, any> = {};
  
  if (params.offset !== undefined) queryParams.offset = params.offset;
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.search) queryParams.search = params.search;
  if (params.states && params.states.length > 0) queryParams.states = params.states;
  
  return queryParams;
};

/**
 * Query key generators for React Query
 */
export const createQueryKey = (entity: string, params?: Record<string, any>) => {
  if (!params) return [entity];
  return [entity, params];
};

export const createListQueryKey = (entity: string, pagination?: PaginationParams) => {
  return createQueryKey(`${entity}-list`, pagination);
};

export const createDetailQueryKey = (entity: string, id: string | number) => {
  return createQueryKey(`${entity}-detail`, { id });
}; 