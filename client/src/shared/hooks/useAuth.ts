import { useState, useEffect, useCallback } from 'react';
import { authApi, LoginRequest, tokenManager } from '../../api';

// Using the API User interface
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  permissions: number;
  is_active?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Updated permissions constants to match backend
export const PERMISSIONS = {
  CLIENTES: 1,    // 001
  PRODUCTOS: 2,   // 010
  DASHBOARD: 4,   // 100
  VENTAS: 8,      // 1000
  USUARIOS: 16,   // 10000
} as const;

// Helper functions for permission checking
export const hasPermission = (userPermissions: number, permission: number): boolean => {
  return (userPermissions & permission) !== 0;
};

export const getUserRole = (permissions: number): string => {
  if (permissions === 0) return 'Sin permisos';
  if (permissions === 31) return 'Super Admin'; // 11111 - todos los permisos
  if (permissions >= 16) return 'Administrador'; // Incluye usuarios
  if (permissions >= 8) return 'Manager'; // Incluye ventas
  if (permissions >= 4) return 'Supervisor'; // Incluye dashboard
  if (permissions >= 2) return 'Repositor'; // Solo productos
  if (permissions >= 1) return 'Recepcionista'; // Solo clientes
  return 'Personalizado';
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // El sistema de inactividad se maneja en AuthProvider

  useEffect(() => {
    // Check initial auth status
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = tokenManager.getToken();
      const storedUser = localStorage.getItem('gostore_user');
      
      if (token && tokenManager.hasValidToken() && storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Token inválido o no existe
        tokenManager.clearTokens();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      tokenManager.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const credentials: LoginRequest = { username, password };
      const response = await authApi.login(credentials);
      
      if (response.user && response.token) {
        const user: User = {
          id: response.user.id,
          username: response.user.username,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          permissions: response.user.permissions,
          is_active: response.user.is_active,
        };

        // Store tokens and user data
        tokenManager.setTokens(response.token, response.refresh_token);
        localStorage.setItem('gostore_user', JSON.stringify(user));
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    tokenManager.clearTokens();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    // Solo limpiar datos, no manejar redirección aquí
    // La redirección la manejarán los componentes según sea necesario
  }, []);

  // Force logout due to inactivity - moved to AuthProvider

  // Helper functions for checking permissions
  const canAccess = (permission: number): boolean => {
    if (!authState.user) return false;
    return hasPermission(authState.user.permissions, permission);
  };

  const canAccessClients = (): boolean => canAccess(PERMISSIONS.CLIENTES);
  const canAccessProducts = (): boolean => canAccess(PERMISSIONS.PRODUCTOS);
  const canAccessDashboard = (): boolean => canAccess(PERMISSIONS.DASHBOARD);
  const canAccessSales = (): boolean => canAccess(PERMISSIONS.VENTAS);
  const canAccessUsers = (): boolean => canAccess(PERMISSIONS.USUARIOS);

  const isAdmin = (): boolean => {
    return authState.user ? canAccessUsers() : false;
  };

  const getUserRoleText = (): string => {
    return authState.user ? getUserRole(authState.user.permissions) : 'Sin sesión';
  };

  return {
    ...authState,
    login,
    logout,
    canAccess,
    canAccessClients,
    canAccessProducts,
    canAccessDashboard,
    canAccessSales,
    canAccessUsers,
    isAdmin,
    getUserRoleText,
    checkAuthStatus,
  };
} 
