package user

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/dto"
)

func (s Service) Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error) {
	// Validaciones
	if req.Username == "" {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"username cannot be empty")
	}

	if req.Password == "" {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"password cannot be empty")
	}

	// Normalizar username
	username := strings.TrimSpace(strings.ToLower(req.Username))

	// Buscar usuario
	user, err := s.Repo.GetUserByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return &dto.LoginResponse{
				Message: "Invalid username or password",
			}, nil
		}
		return nil, fmt.Errorf("error getting user: %w", err)
	}

	// Verificar si está activo
	if !user.IsActive {
		return &dto.LoginResponse{
			Message: "User account is deactivated",
		}, nil
	}

	// Verificar password con bcrypt
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		// bcrypt.ErrMismatchedHashAndPassword significa que la contraseña no coincide
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return &dto.LoginResponse{
				Message: "Invalid username or password",
			}, nil
		}
		// Cualquier otro error de bcrypt
		return nil, fmt.Errorf("error verifying password: %w", err)
	}

	// Generar JWT token
	if s.JWTService != nil {
		token, err := s.JWTService.GenerateToken(&user.User)
		if err != nil {
			return nil, fmt.Errorf("error generating token: %w", err)
		}

		refreshToken, err := s.JWTService.GenerateRefreshToken(&user.User)
		if err != nil {
			return nil, fmt.Errorf("error generating refresh token: %w", err)
		}

		// Actualizar last login
		err = s.Repo.UpdateUserLastLogin(ctx, user.ID)
		if err != nil {
			// No fallar el login por esto, solo loguearlo
			fmt.Printf("Failed to update last login for user %d: %v\n", user.ID, err)
		}

		// Login exitoso con token
		return &dto.LoginResponse{
			User: &dto.UserResponse{
				ID:          user.ID,
				Username:    user.Username,
				FirstName:   user.FirstName,
				LastName:    user.LastName,
				Permissions: user.Permissions,
				IsActive:    user.IsActive,
			},
			Token:        token,
			RefreshToken: refreshToken,
			Message:      "Login successful",
		}, nil
	}

	// Actualizar last login
	err = s.Repo.UpdateUserLastLogin(ctx, user.ID)
	if err != nil {
		// No fallar el login por esto, solo loguearlo
		fmt.Printf("Failed to update last login for user %d: %v\n", user.ID, err)
	}

	// Login exitoso sin token (backward compatibility)
	return &dto.LoginResponse{
		User: &dto.UserResponse{
			ID:          user.ID,
			Username:    user.Username,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			Permissions: user.Permissions,
			IsActive:    user.IsActive,
		},
		Message: "Login successful",
	}, nil
}

// RefreshToken genera un nuevo token usando un refresh token
func (s Service) RefreshToken(ctx context.Context, req *dto.RefreshTokenRequest) (*dto.RefreshTokenResponse, error) {
	// Validar que el refresh token esté presente
	if req.RefreshToken == "" {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"refresh token is required")
	}

	if s.JWTService == nil {
		return nil, domain.NewAppError(
			domain.ErrCodeInternalServerError,
			"JWT service not available")
	}

	// Validar el refresh token
	claims, err := s.JWTService.ValidateToken(req.RefreshToken)
	if err != nil {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"invalid or expired refresh token")
	}

	// Verificar que sea un refresh token (issuer debe ser gostore-refresh)
	if claims.Issuer != "gostore-refresh" {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"invalid refresh token type")
	}

	// Obtener el usuario actual para verificar que siga activo
	user, err := s.Repo.GetUserByID(ctx, claims.UserID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, domain.NewAppError(
				domain.ErrCodeNotFound,
				"user not found")
		}
		return nil, fmt.Errorf("error getting user: %w", err)
	}

	// Verificar que el usuario siga activo
	if !user.IsActive {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"user account is deactivated")
	}

	// Generar nuevo access token
	newToken, err := s.JWTService.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("error generating new token: %w", err)
	}

	// Opcionalmente, generar nuevo refresh token (rotación de tokens)
	newRefreshToken, err := s.JWTService.GenerateRefreshToken(user)
	if err != nil {
		return nil, fmt.Errorf("error generating new refresh token: %w", err)
	}

	return &dto.RefreshTokenResponse{
		Token:        newToken,
		RefreshToken: newRefreshToken,
		Message:      "Token refreshed successfully",
	}, nil
}
