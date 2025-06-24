import axios from "axios";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

// Client API functions
export interface Client {
  id: number;
  name: string;
  lastname: string;
  dni: string;
  state: {
    id: number;
    description: string;
  };
}

// Full client details (for individual client view)
export interface ClientDetail {
  id: number;
  name: string;
  lastname: string;
  dni: string;
  state: {
    id: number;
    description: string;
  };
  email: string;
  phone: string;
  address: string;
  sales: any[];
}

// Backend API response structure
export interface ApiClientsResponse {
  results: Client[];
  count: number;
}

// Frontend expected response structure
export interface ClientsResponse {
  clients: Client[];
  total: number;
  hasMore: boolean;
}

export interface ClientsParams {
  limit?: number;
  offset?: number;
  search?: string;
  states?: number[];
  signal?: AbortSignal;
}

export const clientsApi = {
  // Get all clients with pagination and search
  getAll: async (params: ClientsParams = {}): Promise<ApiClientsResponse> => {
    const searchParams = new URLSearchParams();

    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset !== undefined)
      searchParams.append("offset", params.offset.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.states && params.states.length > 0) {
      searchParams.append("states", params.states.join(","));
    }

    const response = await api.get(`/api/clients?${searchParams}`, {
      signal: params.signal,
    });

    return response.data;
  },

  // Get client by ID
  getById: async (id: number): Promise<ClientDetail> => {
    const response = await api.get(`/api/clients/${id}`);

    return response.data;
  },

  // Create new client
  create: async (client: Omit<ClientDetail, "id">): Promise<ClientDetail> => {
    const response = await api.post("/api/clients", client);

    return response.data;
  },

  // Update client
  update: async (
    id: number,
    client: Partial<ClientDetail>,
  ): Promise<ClientDetail> => {
    const response = await api.put(`/api/clients/${id}`, client);

    return response.data;
  },

  // Delete client
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/clients/${id}`);
  },
};

// Notes API functions
export interface Note {
  id: any;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export const notesApi = {
  // Create a new note for a sale
  create: async (saleId: string, content: string): Promise<Note> => {
    const response = await api.post(`/api/sales/${saleId}/notes`, {
      content,
    });
    return response.data;
  },

  // Delete a note by ID
  delete: async (noteId: string): Promise<void> => {
    await api.delete(`/api/notes/${noteId}`);
  },
};

// Descargar ficha de venta en PDF
export const downloadSaleSheet = async (saleId: number) => {
  const response = await api.get(`/api/pdf/venta/${saleId}`, {
    responseType: 'blob',
  });
  // Crear un enlace para descargar el archivo
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `venta_${saleId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};

// Descargar libro de ventas pendientes en PDF
export const downloadSalesBook = async () => {
  const response = await api.get('/api/pdf/libro-ventas', {
    responseType: 'blob',
  });
  // Crear un enlace para descargar el archivo
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'libro_ventas_pendientes.pdf');
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};

// Export default api instance
export default api;
