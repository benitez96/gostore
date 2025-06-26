import axios from "axios";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Token storage keys
const TOKEN_KEY = "gostore_token";
const REFRESH_TOKEN_KEY = "gostore_refresh_token";
const USER_KEY = "gostore_user";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable to track if we're currently refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem(TOKEN_KEY);

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
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { token: newToken, refresh_token: newRefreshToken } = response.data;

          // Update stored tokens
          localStorage.setItem(TOKEN_KEY, newToken);
          if (newRefreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }

          // Update default authorization header
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

          // Process queued requests
          processQueue(null, newToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          processQueue(refreshError, null);
          clearTokens();
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available - logout user
        isRefreshing = false;
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

// Helper function to clear tokens
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete api.defaults.headers.common.Authorization;
};

// Export token management functions
export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (token: string, refreshToken?: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  clearTokens,
  hasValidToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    try {
      // Basic token validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  },
};

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

// Descargar comprobante de pago en PDF
export const downloadPaymentReceipt = async (paymentId: string | number) => {
  const response = await api.post(
    "/api/pdf/generate-receipt",
    { payment_id: paymentId },
    { responseType: "blob" },
  );
  // Crear un enlace para descargar el archivo
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `comprobante_pago_${paymentId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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

// Auth API functions
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  permissions: number;
  is_active: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user?: User;
  token?: string;
  refresh_token?: string;
  message: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  permissions: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  permissions?: number;
  is_active?: boolean;
}

export interface UpdatePasswordRequest {
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token?: string;
  message: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post("/api/auth/refresh", { 
      refresh_token: refreshToken 
    });
    return response.data;
  },

  // Get all users
  getUsers: async (isActive?: boolean): Promise<User[]> => {
    const params = isActive !== undefined ? `?active=${isActive}` : '';
    const response = await api.get(`/api/users${params}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  // Create user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post("/api/users", userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  // Update user password
  updateUserPassword: async (id: number, passwordData: UpdatePasswordRequest): Promise<void> => {
    await api.put(`/api/users/${id}/password`, passwordData);
  },

  // Reset user password to custom password
  resetUserPassword: async (id: number, newPassword: string): Promise<void> => {
    await api.put(`/api/users/${id}/password`, { password: newPassword });
  },

  // Toggle user active status
  toggleUserActive: async (id: number, isActive: boolean): Promise<User> => {
    // Primero obtenemos el usuario actual para tener todos sus datos
    const currentUser = await authApi.getUserById(id);
    // Luego enviamos un UPDATE completo con todos los campos requeridos
    const response = await api.put(`/api/users/${id}`, {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      permissions: currentUser.permissions,
      is_active: isActive
    });
    return response.data;
  },

  // Delete user (soft delete) - mantener por compatibilidad
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },
};

// Export default api instance
export default api;
