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
			ID:     p.ID,
			Amount: p.Amount,
			Date:   &p.Date,
		})
	}

	return payments, nil
}
