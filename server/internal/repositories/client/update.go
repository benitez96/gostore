package repositories

import (
	"database/sql"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) Update(c *domain.Client) (err error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedID, err := utils.ParseToInt64(c.ID.(string))
	if err != nil {
		return err
	}

	return r.Queries.UpdateClient(ctx, sqlc.UpdateClientParams{
		Name:     c.Name,
		Lastname: c.Lastname,
		Dni:      c.Dni,
		Email:    sql.NullString{String: c.Email, Valid: c.Email != ""},
		Phone:    sql.NullString{String: c.Phone, Valid: c.Phone != ""},
		Address:  sql.NullString{String: c.Address, Valid: c.Address != ""},
		ID:       parsedID,
	})
}

func (r *Repository) UpdateState(clientID string, stateID int) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedID, err := utils.ParseToInt64(clientID)
	if err != nil {
		return err
	}

	return r.Queries.UpdateClientState(ctx, sqlc.UpdateClientStateParams{
		StateID: int64(stateID),
		ID:      parsedID,
	})
}
