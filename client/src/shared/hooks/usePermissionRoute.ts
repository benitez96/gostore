import { useAuthContext } from '../../components/AuthProvider';
import { PERMISSIONS } from './useAuth';

export const usePermissionRoute = () => {
  const auth = useAuthContext();

  console.log('🔐 usePermissionRoute:', {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    hasUser: !!auth.user,
    userPermissions: auth.user?.permissions
  });

  const checkRouteAccess = (requiredPermissions: number[] = []): boolean => {
    if (!auth.isAuthenticated) return false;
    
    if (requiredPermissions.length === 0) return true;
    
    return requiredPermissions.some(permission => auth.canAccess(permission));
  };

  const getPermissionError = (requiredPermissions: number[]): string => {
    const permissionNames = requiredPermissions.map(permission => {
      switch (permission) {
        case PERMISSIONS.CLIENTES: return 'Clientes';
        case PERMISSIONS.PRODUCTOS: return 'Productos';
        case PERMISSIONS.DASHBOARD: return 'Dashboard';
        case PERMISSIONS.VENTAS: return 'Ventas';
        case PERMISSIONS.USUARIOS: return 'Usuarios';
        default: return 'esta funcionalidad';
      }
    });
    
    return `Necesitas permisos de ${permissionNames.join(' o ')} para acceder a esta sección.`;
  };

  // Métodos de conveniencia para rutas específicas
  const canAccessClientsRoute = () => checkRouteAccess([PERMISSIONS.CLIENTES]);
  const canAccessProductsRoute = () => checkRouteAccess([PERMISSIONS.PRODUCTOS]);
  const canAccessDashboardRoute = () => checkRouteAccess([PERMISSIONS.DASHBOARD]);
  const canAccessSalesRoute = () => checkRouteAccess([PERMISSIONS.VENTAS]);
  const canAccessUsersRoute = () => checkRouteAccess([PERMISSIONS.USUARIOS]);
  
  // Métodos para rutas que requieren múltiples permisos
  const canAccessManagementRoute = () => checkRouteAccess([
    PERMISSIONS.CLIENTES, 
    PERMISSIONS.PRODUCTOS, 
    PERMISSIONS.VENTAS
  ]);
  
  const canAccessReportsRoute = () => checkRouteAccess([
    PERMISSIONS.DASHBOARD, 
    PERMISSIONS.VENTAS
  ]);

  return {
    // Estado general
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    
    // Métodos principales
    checkRouteAccess,
    getPermissionError,
    
    // Métodos de conveniencia
    canAccessClientsRoute,
    canAccessProductsRoute,
    canAccessDashboardRoute,
    canAccessSalesRoute,
    canAccessUsersRoute,
    canAccessManagementRoute,
    canAccessReportsRoute,
    
    // Info del usuario
    user: auth.user,
    userRole: auth.getUserRoleText(),
    isAdmin: auth.isAdmin(),
  };
}; 