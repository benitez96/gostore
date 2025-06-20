package repositories

import (
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) UpdatePaymentStatus(saleID string, isPaid bool, stateID int) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedID, err := utils.ParseToInt64(saleID)
	if err != nil {
		return err
	}

	return r.Queries.UpdateSalePaymentStatus(ctx, sqlc.UpdateSalePaymentStatusParams{
		IsPaid:  isPaid,
		StateID: int64(stateID),
		ID:      parsedID,
	})
}
