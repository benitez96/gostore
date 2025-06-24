package repositories

import (
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) Count(search string, stateIds []int64) (int, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	// Si no se proporcionan estados, usar string vacío para obtener todos
	filterFlag := ""
	if len(stateIds) > 0 && len(stateIds) < 3 { // Si no están los 3 estados seleccionados
		filterFlag = "filter"
	}

	count, err := r.Queries.CountClients(ctx, sqlc.CountClientsParams{
		Name:     startsWith(search),
		Lastname: startsWith(search),
		Dni:      startsWith(search),
		Column4:  filterFlag,
		StateIds: stateIds,
	})
	if err != nil {
		return 0, err
	}

	return int(count), nil
}
