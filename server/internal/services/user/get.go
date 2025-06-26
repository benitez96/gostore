package user

import (
	"context"
	"errors"
	"fmt"

	"github.com/benitez96/gostore/internal/domain"
)

func (s Service) GetUsers(ctx context.Context, isActive bool) ([]*domain.UserSummary, error) {
	users, err := s.Repo.GetUsers(ctx, isActive)
	if err != nil {
		return nil, fmt.Errorf("unexpected error getting users: %w", err)
	}

	return users, nil
}

func (s Service) GetAllUsers(ctx context.Context) ([]*domain.UserSummary, error) {
	users, err := s.Repo.GetAllUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("unexpected error getting all users: %w", err)
	}

	return users, nil
}

func (s Service) GetUserByID(ctx context.Context, id int64) (*domain.User, error) {
	if id <= 0 {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"user ID must be greater than 0")
	}

	user, err := s.Repo.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, domain.NewAppError(domain.ErrCodeNotFound,
				fmt.Sprintf("user with ID %d not found", id))
		}
		return nil, fmt.Errorf("unexpected error getting user by ID: %w", err)
	}

	return user, nil
}
