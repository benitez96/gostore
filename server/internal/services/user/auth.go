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

	// Actualizar last login
	err = s.Repo.UpdateUserLastLogin(ctx, user.ID)
	if err != nil {
		// No fallar el login por esto, solo loguearlo
		fmt.Printf("Failed to update last login for user %d: %v\n", user.ID, err)
	}

	// Login exitoso
	return &dto.LoginResponse{
		User: &dto.UserResponse{
			ID:          user.ID,
			Username:    user.Username,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			Permissions: user.Permissions,
		},
		Message: "Login successful",
	}, nil
}
