package repositories

import (
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) Delete(paymentID string) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedID, err := utils.ParseToInt64(paymentID)
	if err != nil {
		return err
	}

	return r.Queries.DeletePayment(ctx, parsedID)
}
