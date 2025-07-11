import { ReactNode } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';

interface ProtectedComponentProps {
  children: ReactNode;
  permission?: number; // Bitmask permission (use PERMISSIONS constants)
  requiredPermissions?: number; // All these permissions required (AND)
  fallback?: ReactNode;
}

export function ProtectedComponent({ 
  children, 
  permission, 
  requiredPermissions,
  fallback = null 
}: ProtectedComponentProps) {
  const { user, canAccess } = useAuth();

  // If not authenticated, don't show anything
  if (!user) {
    return <>{fallback}</>;
  }

  // Check by specific permission (OR logic)
  if (permission && !canAccess(permission)) {
    return <>{fallback}</>;
  }

  // Check by required permissions (AND logic)
  if (requiredPermissions && (user.permissions & requiredPermissions) !== requiredPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 