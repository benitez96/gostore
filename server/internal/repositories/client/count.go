package repositories

import (
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) Count(search string) (int, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	count, err := r.Queries.CountClients(ctx, sqlc.CountClientsParams{
		Name:     startsWith(search),
		Lastname: startsWith(search),
		Dni:      startsWith(search),
	})
	if err != nil {
		return 0, err
	}

	return int(count), nil
}
