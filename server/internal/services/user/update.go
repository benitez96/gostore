package user

import (
	"context"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/dto"
)

func (s Service) UpdateUser(ctx context.Context, id int64, req *dto.UpdateUserRequest) error {
	// Validaciones
	if id <= 0 {
		return domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"user ID must be greater than 0")
	}

	if req.FirstName == "" {
		return domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"firstName cannot be empty")
	}

	if req.LastName == "" {
		return domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"lastName cannot be empty")
	}

	if req.Permissions < 0 {
		return domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"permissions must be non-negative")
	}

	// Verificar que el usuario existe
	_, err := s.Repo.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return domain.NewAppError(domain.ErrCodeNotFound,
				fmt.Sprintf("user with ID %d not found", id))
		}
		return fmt.Errorf("error getting user: %w", err)
	}

	err = s.Repo.UpdateUser(ctx, id, req)
	if err != nil {
		return fmt.Errorf("unexpected error updating user: %w", err)
	}

	return nil
}

func (s Service) UpdateUserPassword(ctx context.Context, id int64, req *dto.UpdateUserPasswordRequest) error {
	// Validaciones
	if id <= 0 {
		return domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"user ID must be greater than 0")
	}

	if req.Password == "" {
		return domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"password cannot be empty")
	}

	if len(req.Password) < 6 {
		return domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"password must be at least 6 characters long")
	}

	// Verificar que el usuario existe
	_, err := s.Repo.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return domain.NewAppError(domain.ErrCodeNotFound,
				fmt.Sprintf("user with ID %d not found", id))
		}
		return fmt.Errorf("error getting user: %w", err)
	}

	// Hashear nueva password con bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("error hashing password: %w", err)
	}

	err = s.Repo.UpdateUserPassword(ctx, id, string(hashedPassword))
	if err != nil {
		return fmt.Errorf("unexpected error updating user password: %w", err)
	}

	return nil
}

func (s Service) DeleteUser(ctx context.Context, id int64) error {
	// Validaciones
	if id <= 0 {
		return domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"user ID must be greater than 0")
	}

	// Verificar que el usuario existe
	_, err := s.Repo.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return domain.NewAppError(domain.ErrCodeNotFound,
				fmt.Sprintf("user with ID %d not found", id))
		}
		return fmt.Errorf("error getting user: %w", err)
	}

	err = s.Repo.DeleteUser(ctx, id)
	if err != nil {
		return fmt.Errorf("unexpected error deleting user: %w", err)
	}

	return nil
}
