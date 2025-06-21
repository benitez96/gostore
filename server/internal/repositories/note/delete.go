package repositories

import (
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) Delete(id string) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	noteID, err := utils.ParseToInt64(id)
	if err != nil {
		return err
	}

	return r.Queries.DeleteNote(ctx, noteID)
}
