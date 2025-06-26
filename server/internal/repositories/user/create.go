package repositories

import (
	"context"
	"database/sql"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/dto"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) CreateUser(ctx context.Context, req *dto.CreateUserRequest) (*domain.User, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	firstName := sql.NullString{String: req.FirstName, Valid: req.FirstName != ""}
	lastName := sql.NullString{String: req.LastName, Valid: req.LastName != ""}

	row, err := r.Queries.InsertUser(ctx, sqlc.InsertUserParams{
		Username:     req.Username,
		PasswordHash: req.Password, // Se hashea en el servicio
		Permissions:  req.Permissions,
		FirstName:    firstName,
		LastName:     lastName,
		IsActive:     true,
	})

	if err != nil {
		return nil, manageError(err)
	}

	user := &domain.User{
		ID:          row.ID,
		Username:    row.Username,
		FirstName:   parseNullStringToString(row.FirstName),
		LastName:    parseNullStringToString(row.LastName),
		Permissions: row.Permissions,
		IsActive:    row.IsActive,
		CreatedAt:   row.CreatedAt,
		UpdatedAt:   row.UpdatedAt,
	}

	return user, nil
}
