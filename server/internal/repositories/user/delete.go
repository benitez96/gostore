package repositories

import (
	"context"

	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) DeleteUser(ctx context.Context, id int64) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	err := r.Queries.DeleteUser(ctx, id)
	if err != nil {
		return manageError(err)
	}

	return nil
}
