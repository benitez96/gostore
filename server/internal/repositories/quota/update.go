package repositories

import (
	"database/sql"
	"time"

	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) UpdatePaymentStatus(quotaID string, isPaid bool, stateID int) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedID, err := utils.ParseToInt64(quotaID)
	if err != nil {
		return err
	}

	return r.Queries.UpdateQuotaPaymentStatus(ctx, sqlc.UpdateQuotaPaymentStatusParams{
		IsPaid:  sql.NullBool{Bool: isPaid, Valid: true},
		StateID: int64(stateID),
		ID:      parsedID,
	})
}

func (r *Repository) Update(quotaID string, amount float64, dueDate time.Time) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedID, err := utils.ParseToInt64(quotaID)
	if err != nil {
		return err
	}

	return r.Queries.UpdateQuota(ctx, sqlc.UpdateQuotaParams{
		Amount:  amount,
		DueDate: dueDate,
		ID:      parsedID,
	})
}
