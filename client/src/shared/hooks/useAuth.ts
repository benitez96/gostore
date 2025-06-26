import { useState, useEffect } from 'react';
import { authApi, User as ApiUser, LoginRequest } from '../../api';

// Using the API User interface
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  permissions: number; // Bitmask: 1=clientes, 2=productos, 4=dashboard
  is_active?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Bitmask permissions constants
export const PERMISSIONS = {
  CLIENTES: 1,   // 001
  PRODUCTOS: 2,  // 010
  DASHBOARD: 4,  // 100
} as const;

// Helper functions for permission checking
export const hasPermission = (userPermissions: number, permission: number): boolean => {
  return (userPermissions & permission) !== 0;
};

export const getUserRole = (permissions: number): string => {
  switch (permissions) {
    case 0: return 'Sin permisos';
    case 1: return 'Solo clientes';
    case 2: return 'Repositor';
    case 3: return 'Empleado';
    case 4: return 'Solo dashboard';
    case 6: return 'Caja';
    case 7: return 'Administrador';
    default: return 'Personalizado';
  }
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check if user is logged in (from localStorage or token)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // TODO: Replace with real API call
      // For now, check localStorage or mock data
      const storedUser = localStorage.getItem('gostore_user');
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
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
      
      if (response.user) {
        const user: User = {
          id: response.user.id,
          username: response.user.username,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          permissions: response.user.permissions,
          is_active: true,
        };

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
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('gostore_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Helper functions for checking permissions
  const canAccess = (permission: number): boolean => {
    if (!authState.user) return false;
    return hasPermission(authState.user.permissions, permission);
  };

  const canAccessClients = (): boolean => canAccess(PERMISSIONS.CLIENTES);
  const canAccessProducts = (): boolean => canAccess(PERMISSIONS.PRODUCTOS);
  const canAccessDashboard = (): boolean => canAccess(PERMISSIONS.DASHBOARD);

  const isAdmin = (): boolean => {
    return authState.user?.permissions === 7; // 111 - all permissions
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
    isAdmin,
    getUserRoleText,
    checkAuthStatus,
  };
} 