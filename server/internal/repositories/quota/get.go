package repositories

import (
	"fmt"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) GetBySaleID(id string) ([]*domain.Quota, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedId, err := utils.ParseToInt64(id)
	if err != nil {
		return nil, domain.ErrIncorrectID
	}

	quotasDB, err := r.Queries.GetSaleQuotas(ctx, parsedId)
	if err != nil {
		return nil, err
	}

	quotas := make([]*domain.Quota, 0, len(quotasDB))
	for _, q := range quotasDB {
		quotas = append(quotas, &domain.Quota{
			ID:       fmt.Sprintf("%d", q.ID),
			Number:   uint(q.Number),
			Amount:   q.Amount,
			IsPaid:   q.IsPaid.Bool,
			StateID:  int(q.StateID),
			DueDate:  &q.DueDate,
			SaleID:   fmt.Sprintf("%d", q.SaleID),
			Payments: []*domain.Payment{},
		})
	}

	return quotas, nil
}

func (r *Repository) GetByID(id string) (*domain.Quota, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedId, err := utils.ParseToInt64(id)
	if err != nil {
		return nil, domain.ErrIncorrectID
	}

	quotaDB, err := r.Queries.GetQuotaByID(ctx, parsedId)
	if err != nil {
		return nil, err
	}

	return &domain.Quota{
		ID:       fmt.Sprintf("%d", quotaDB.ID),
		Number:   uint(quotaDB.Number),
		Amount:   quotaDB.Amount,
		IsPaid:   quotaDB.IsPaid.Bool,
		StateID:  int(quotaDB.StateID),
		DueDate:  &quotaDB.DueDate,
		SaleID:   fmt.Sprintf("%d", quotaDB.SaleID),
		Payments: []*domain.Payment{},
	}, nil
}
