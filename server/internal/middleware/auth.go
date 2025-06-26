package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/benitez96/gostore/internal/services/jwt"
	"github.com/julienschmidt/httprouter"
)

// AuthContextKey es la key para almacenar los claims en el contexto
type AuthContextKey string

const UserClaimsKey AuthContextKey = "user_claims"

// AuthMiddleware es el middleware de autenticación JWT
type AuthMiddleware struct {
	jwtService *jwt.Service
}

// NewAuthMiddleware crea una nueva instancia del middleware
func NewAuthMiddleware(jwtService *jwt.Service) *AuthMiddleware {
	return &AuthMiddleware{
		jwtService: jwtService,
	}
}

// RequireAuth middleware que requiere autenticación JWT
func (m *AuthMiddleware) RequireAuth(next httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		// Obtener el header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Verificar que tenga el formato "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		// Validar el token
		claims, err := m.jwtService.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Agregar claims al contexto
		ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
		r = r.WithContext(ctx)

		// Continuar con el siguiente handler
		next(w, r, ps)
	}
}

// OptionalAuth middleware que permite autenticación opcional
func (m *AuthMiddleware) OptionalAuth(next httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString := parts[1]
				if claims, err := m.jwtService.ValidateToken(tokenString); err == nil {
					ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
					r = r.WithContext(ctx)
				}
			}
		}

		next(w, r, ps)
	}
}

// RequirePermission middleware que requiere permisos específicos
func (m *AuthMiddleware) RequirePermission(permission int64) func(httprouter.Handle) httprouter.Handle {
	return func(next httprouter.Handle) httprouter.Handle {
		return m.RequireAuth(func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
			// Obtener claims del contexto
			claims, ok := r.Context().Value(UserClaimsKey).(*jwt.Claims)
			if !ok {
				http.Error(w, "Invalid user context", http.StatusInternalServerError)
				return
			}

			// Verificar permisos (usando bitwise AND)
			if claims.Permissions&permission == 0 {
				http.Error(w, "Insufficient permissions", http.StatusForbidden)
				return
			}

			next(w, r, ps)
		})
	}
}

// GetUserClaims extrae los claims del contexto
func GetUserClaims(r *http.Request) (*jwt.Claims, bool) {
	claims, ok := r.Context().Value(UserClaimsKey).(*jwt.Claims)
	return claims, ok
}
