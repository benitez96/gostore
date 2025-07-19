import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '../shared/hooks/useAuth';
import { useIdleWithWarning } from '../shared/hooks/useIdleWithWarning';
import { IdleWarning, UnauthorizedPage, UnauthenticatedPage } from '../shared/components/auth';

// Crear contexto de autenticación
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();
  const wasAuthenticatedRef = useRef(false);

  // Sistema de inactividad con warning
  const idle = useIdleWithWarning({
    idleTimeout: 30 * 60 * 1000, // 5 minutos total
    warningTimeout: 30 * 1000,  // 30 segundos de warning
    onLogout: () => {
      // Limpiar el estado de autenticación cuando se hace logout por inactividad
      auth.logout();
      wasAuthenticatedRef.current = false;
    },
  });

  // Manejar el estado de autenticación sin causar loops infinitos
  useEffect(() => {
    if (auth.isAuthenticated && !wasAuthenticatedRef.current) {
      // Usuario se acaba de autenticar
      wasAuthenticatedRef.current = true;
      idle.reset();
    } else if (!auth.isAuthenticated && wasAuthenticatedRef.current) {
      // Usuario se acaba de desautenticar
      wasAuthenticatedRef.current = false;
      // Resetear el idle timer cuando se desautentica para limpiar el estado
      idle.reset();
    } else if (!auth.isAuthenticated && !wasAuthenticatedRef.current) {
      // Usuario no autenticado desde el inicio - resetear el idle timer
      idle.reset();
    }
  }, [auth.isAuthenticated, idle]);

  // Escuchar eventos de logout para resetear el estado
  useEffect(() => {
    const handleLogout = () => {
      wasAuthenticatedRef.current = false;
      idle.reset();
    };
    
    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:logout:complete', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:logout:complete', handleLogout);
    };
  }, [idle]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
      
      {/* Modal de advertencia de inactividad - solo mostrar si está autenticado */}
      {auth.isAuthenticated && (
        <IdleWarning
          isVisible={idle.showWarning}
          timeRemaining={idle.warningTimeRemaining}
          onStayActive={idle.stayActive}
          onLogout={idle.forceLogout}
        />
      )}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto de autenticación
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Componente de orden superior para proteger rutas
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: number[];
  fallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
  customUnauthorizedMessage?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [],
  fallback,
  unauthorizedFallback,
  customUnauthorizedMessage
}: ProtectedRouteProps) {
  const auth = useAuthContext();

  // Mostrar loading mientras se verifica autenticación
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // No autenticado - redirigir al login
  if (!auth.isAuthenticated) {
    return fallback || <UnauthenticatedPage redirectToLogin={true} redirectDelay={1000} />;
  }

  // Verificar permisos específicos si se requieren
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.some(permission => 
      auth.canAccess(permission)
    );

    if (!hasRequiredPermissions) {
      // Generar mensaje personalizado basado en los permisos requeridos
      let message = customUnauthorizedMessage;
      
      if (!message) {
        const permissionNames = requiredPermissions.map(permission => {
          switch (permission) {
            case 1: return 'Clientes';
            case 2: return 'Productos';
            case 4: return 'Dashboard';
            case 8: return 'Ventas';
            case 16: return 'Usuarios';
            default: return 'esta funcionalidad';
          }
        });
        
        message = `Necesitas permisos de ${permissionNames.join(' o ')} para acceder a esta sección.`;
      }

      return unauthorizedFallback || (
        <UnauthorizedPage 
          message={message}
        />
      );
    }
  }

  return <>{children}</>;
}

export default AuthProvider; 