package constants

// Sistema de permisos por secciones usando bitwise operations
const (
	// Permisos por sección (1, 2, 4, 8, ...)
	PermissionClients   int64 = 1  // 001 - Opera sobre clientes (lectura, escritura, etc.)
	PermissionProducts  int64 = 2  // 010 - Opera sobre productos (lectura, escritura, etc.)
	PermissionDashboard int64 = 4  // 100 - Opera sobre dashboards (gráficos, estadísticas, etc.)
	PermissionSales     int64 = 8  // 1000 - Opera sobre ventas
	PermissionUsers     int64 = 16 // 10000 - Opera sobre usuarios (típicamente solo admin)

	// Combinaciones útiles
	PermissionOperator = PermissionClients | PermissionProducts | PermissionSales // Operador básico
	PermissionManager  = PermissionOperator | PermissionDashboard                 // Manager con acceso a reportes
	PermissionAdmin    = PermissionManager | PermissionUsers                      // Admin completo
)

// GetPermissionName devuelve el nombre descriptivo de un permiso
func GetPermissionName(permission int64) string {
	switch permission {
	case PermissionClients:
		return "Clientes"
	case PermissionProducts:
		return "Productos"
	case PermissionDashboard:
		return "Dashboard"
	case PermissionSales:
		return "Ventas"
	case PermissionUsers:
		return "Usuarios"
	default:
		return "Permiso Desconocido"
	}
}

// GetPermissionNames devuelve los nombres de todos los permisos que tiene un usuario
func GetPermissionNames(userPermissions int64) []string {
	var permissions []string

	if HasPermission(userPermissions, PermissionClients) {
		permissions = append(permissions, "Clientes")
	}
	if HasPermission(userPermissions, PermissionProducts) {
		permissions = append(permissions, "Productos")
	}
	if HasPermission(userPermissions, PermissionDashboard) {
		permissions = append(permissions, "Dashboard")
	}
	if HasPermission(userPermissions, PermissionSales) {
		permissions = append(permissions, "Ventas")
	}
	if HasPermission(userPermissions, PermissionUsers) {
		permissions = append(permissions, "Usuarios")
	}

	if len(permissions) == 0 {
		return []string{"Sin permisos"}
	}

	return permissions
}

// HasPermission verifica si un usuario tiene un permiso específico
func HasPermission(userPermissions, requiredPermission int64) bool {
	return userPermissions&requiredPermission != 0
}

// HasAnyPermission verifica si un usuario tiene alguno de los permisos especificados
func HasAnyPermission(userPermissions int64, permissions ...int64) bool {
	for _, permission := range permissions {
		if HasPermission(userPermissions, permission) {
			return true
		}
	}
	return false
}

// HasAllPermissions verifica si un usuario tiene todos los permisos especificados
func HasAllPermissions(userPermissions int64, permissions ...int64) bool {
	for _, permission := range permissions {
		if !HasPermission(userPermissions, permission) {
			return false
		}
	}
	return true
}
