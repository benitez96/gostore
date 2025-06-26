package repositories

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) GetUsers(ctx context.Context, isActive bool) ([]*domain.UserSummary, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	rows, err := r.Queries.GetUsers(ctx, sqlc.GetUsersParams{
		IsActive: isActive,
		Limit:    100,
		Offset:   0,
	})
	if err != nil {
		return nil, manageError(err)
	}

	users := make([]*domain.UserSummary, len(rows))
	for i, row := range rows {
		users[i] = &domain.UserSummary{
			ID:          row.ID,
			Username:    row.Username,
			FirstName:   parseNullStringToString(row.FirstName),
			LastName:    parseNullStringToString(row.LastName),
			Permissions: row.Permissions,
			IsActive:    row.IsActive,
			LastLoginAt: parseNullTime(row.LastLoginAt),
			CreatedAt:   row.CreatedAt,
		}
	}

	return users, nil
}

func (r *Repository) GetAllUsers(ctx context.Context) ([]*domain.UserSummary, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	rows, err := r.Queries.GetAllUsers(ctx)
	if err != nil {
		return nil, manageError(err)
	}

	users := make([]*domain.UserSummary, len(rows))
	for i, row := range rows {
		users[i] = &domain.UserSummary{
			ID:          row.ID,
			Username:    row.Username,
			FirstName:   parseNullStringToString(row.FirstName),
			LastName:    parseNullStringToString(row.LastName),
			Permissions: row.Permissions,
			IsActive:    row.IsActive,
			LastLoginAt: parseNullTime(row.LastLoginAt),
			CreatedAt:   row.CreatedAt,
		}
	}

	return users, nil
}

func (r *Repository) GetUserByID(ctx context.Context, id int64) (*domain.User, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	row, err := r.Queries.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, manageError(err)
	}

	user := &domain.User{
		ID:          row.ID,
		Username:    row.Username,
		FirstName:   parseNullStringToString(row.FirstName),
		LastName:    parseNullStringToString(row.LastName),
		Permissions: row.Permissions,
		IsActive:    row.IsActive,
		LastLoginAt: parseNullTime(row.LastLoginAt),
		CreatedAt:   row.CreatedAt,
		UpdatedAt:   row.UpdatedAt,
	}

	return user, nil
}

func (r *Repository) GetUserByUsername(ctx context.Context, username string) (*domain.UserWithPassword, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	row, err := r.Queries.GetUserByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, manageError(err)
	}

	user := &domain.UserWithPassword{
		User: domain.User{
			ID:          row.ID,
			Username:    row.Username,
			FirstName:   parseNullStringToString(row.FirstName),
			LastName:    parseNullStringToString(row.LastName),
			Permissions: row.Permissions,
			IsActive:    row.IsActive,
			LastLoginAt: parseNullTime(row.LastLoginAt),
			CreatedAt:   row.CreatedAt,
			UpdatedAt:   row.UpdatedAt,
		},
		PasswordHash: row.PasswordHash,
	}

	return user, nil
}

func parseNullString(ns sql.NullString) *string {
	if !ns.Valid {
		return nil
	}
	return &ns.String
}

func parseNullStringToString(ns sql.NullString) string {
	if !ns.Valid {
		return ""
	}
	return ns.String
}

func parseNullTime(nt sql.NullTime) *time.Time {
	if !nt.Valid {
		return nil
	}
	return &nt.Time
}

func manageError(err error) error {
	if errors.Is(err, context.Canceled) {
		return domain.ErrTimeout
	}
	return err
}
