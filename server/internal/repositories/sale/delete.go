package repositories

import (
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) Delete(saleID string) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedID, err := utils.ParseToInt64(saleID)
	if err != nil {
		return err
	}

	return r.Queries.DeleteSale(ctx, parsedID)
}
