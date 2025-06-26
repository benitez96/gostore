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

func (s Service) CreateUser(ctx context.Context, req *dto.CreateUserRequest) (*domain.User, error) {
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

	if len(req.Password) < 6 {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"password must be at least 6 characters long")
	}

	if req.Permissions < 0 {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"permissions must be non-negative")
	}

	// Normalizar username
	req.Username = strings.TrimSpace(strings.ToLower(req.Username))

	// Verificar si el usuario ya existe
	existingUser, err := s.Repo.GetUserByUsername(ctx, req.Username)
	if err != nil && !errors.Is(err, domain.ErrNotFound) {
		return nil, fmt.Errorf("error checking existing user: %w", err)
	}
	if existingUser != nil {
		return nil, domain.NewAppError(
			domain.ErrCodeDuplicateKey,
			"username already exists")
	}

	// Hashear password con bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("error hashing password: %w", err)
	}

	// Crear request con password hasheado
	createReq := &dto.CreateUserRequest{
		Username:    req.Username,
		Password:    string(hashedPassword),
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Permissions: req.Permissions,
	}

	user, err := s.Repo.CreateUser(ctx, createReq)
	if err != nil {
		return nil, fmt.Errorf("unexpected error creating user: %w", err)
	}

	return user, nil
}
