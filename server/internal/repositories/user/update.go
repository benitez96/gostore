package repositories

import (
	"context"
	"database/sql"

	"github.com/benitez96/gostore/internal/dto"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) UpdateUser(ctx context.Context, id int64, req *dto.UpdateUserRequest) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	firstName := sql.NullString{String: req.FirstName, Valid: req.FirstName != ""}
	lastName := sql.NullString{String: req.LastName, Valid: req.LastName != ""}

	// Get current user data to preserve username and is_active if not specified
	currentUser, err := r.GetUserByID(ctx, id)
	if err != nil {
		return manageError(err)
	}

	// Use provided IsActive value or preserve existing one
	isActive := currentUser.IsActive
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	err = r.Queries.UpdateUser(ctx, sqlc.UpdateUserParams{
		Username:    currentUser.Username, // Preserve existing username
		Permissions: req.Permissions,
		FirstName:   firstName,
		LastName:    lastName,
		IsActive:    isActive,
		ID:          id,
	})

	if err != nil {
		return manageError(err)
	}

	return nil
}

func (r *Repository) UpdateUserPassword(ctx context.Context, id int64, passwordHash string) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	err := r.Queries.UpdateUserPassword(ctx, sqlc.UpdateUserPasswordParams{
		PasswordHash: passwordHash,
		ID:           id,
	})

	if err != nil {
		return manageError(err)
	}

	return nil
}

func (r *Repository) UpdateUserLastLogin(ctx context.Context, id int64) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	err := r.Queries.UpdateUserLastLogin(ctx, id)
	if err != nil {
		return manageError(err)
	}

	return nil
}
