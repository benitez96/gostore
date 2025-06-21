package repositories

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) GetByQuotaID(id string) ([]*domain.Payment, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedId, err := utils.ParseToInt64(id)
	if err != nil {
		return nil, domain.ErrIncorrectID
	}

	paymentsDB, err := r.Queries.GetQuotaPayments(ctx, parsedId)
	if err != nil {
		return nil, err
	}

	payments := make([]*domain.Payment, 0, len(paymentsDB))
	for _, p := range paymentsDB {
		payments = append(payments, &domain.Payment{
			ID:      p.ID,
			Amount:  p.Amount,
			Date:    &p.Date,
			QuotaID: p.QuotaID,
		})
	}

	return payments, nil
}

func (r *Repository) GetByID(id string) (*domain.Payment, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedId, err := utils.ParseToInt64(id)
	if err != nil {
		return nil, domain.ErrIncorrectID
	}

	paymentDB, err := r.Queries.GetPaymentByID(ctx, parsedId)
	if err != nil {
		return nil, err
	}

	return &domain.Payment{
		ID:      paymentDB.ID,
		Amount:  paymentDB.Amount,
		Date:    &paymentDB.Date,
		QuotaID: paymentDB.QuotaID,
	}, nil
}
