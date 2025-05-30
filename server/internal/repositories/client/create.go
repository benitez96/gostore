package repositories

import (
	"fmt"
	"strings"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)


func (r *Repository) Insert(c *domain.Client) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	_, err := r.Queries.InsertClient(ctx, sqlc.InsertClientParams{
		Name:     c.Name,
		Lastname: c.Lastname,
		Dni:      c.Dni,
		Email:    utils.ParseToSqlNullString(c.Email),
		Phone:    utils.ParseToSqlNullString(c.Phone),
		Address:  utils.ParseToSqlNullString(c.Address),
	})

	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return fmt.Errorf("%w: %s", domain.ErrDuplicateKey, err.Error())
		}
		return err
	}

	return nil
}
