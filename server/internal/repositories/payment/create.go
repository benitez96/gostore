package repositories

import (
	"time"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) Create(payment *domain.Payment) error {
	ctx, cancel := utils.GetContext()
	defer cancel()

	// Get the quota to fetch the client_id
	quota, err := r.Queries.GetQuotaByID(ctx, payment.QuotaID)
	if err != nil {
		return err
	}

	// Use current time if date is not provided
	date := time.Now()
	if payment.Date != nil {
		date = *payment.Date
	}

	_, err = r.Queries.CreatePayment(ctx, sqlc.CreatePaymentParams{
		Amount:   payment.Amount,
		Date:     date,
		QuotaID:  quota.ID,
		ClientID: quota.ClientID,
	})

	return err
}
