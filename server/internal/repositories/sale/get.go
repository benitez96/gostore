package repositories

import (
	"github.com/benitez96/gostore/internal/domain"
	// "github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)


func (r *Repository) GetByID(id string) (sale *domain.Sale, err error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedId, err := utils.ParseToInt64(id)

	if err != nil {
		return nil, domain.ErrIncorrectID
	}

	saleDB, err := r.Queries.GetSaleByID(ctx, parsedId)

	if err != nil {
		return nil, err
	}

	sale = &domain.Sale{
		ID:        saleDB.ID,
		Description: saleDB.Description,
		IsPaid: saleDB.IsPaid,
		StateID: int(saleDB.StateID),
		Date: &saleDB.Date,
		Amount: saleDB.Amount,
	}

	return sale, nil
}

func (r *Repository) GetByClientID(id string) (sales []*domain.SaleSummary, err error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedId, err := utils.ParseToInt64(id)

	if err != nil {
		return nil, domain.ErrIncorrectID
	}

	rows, err := r.Queries.GetSalesByClientID(ctx, parsedId)

	result := make([]*domain.SaleSummary, len(rows))
	for i, row := range rows {
		result[i] = &domain.SaleSummary{
			ID:          row.ID,
			Description: row.Description,
			IsPaid:      row.IsPaid,
			StateID:     int(row.StateID),
		}
	}

	return result, nil
}




