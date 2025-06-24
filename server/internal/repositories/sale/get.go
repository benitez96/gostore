package repositories

import (
	"github.com/benitez96/gostore/internal/domain"
	// "github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/ports"
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
		ID:          saleDB.ID,
		Description: saleDB.Description,
		IsPaid:      saleDB.IsPaid,
		StateID:     int(saleDB.StateID),
		Date:        &saleDB.Date,
		Amount:      saleDB.Amount,
		ClientID:    saleDB.ClientID,
	}

	// Fetch notes for this sale
	if r.NoteRepo != nil {
		notes, err := r.NoteRepo.GetBySaleID(id)
		if err != nil {
			// Don't fail the entire request if notes can't be fetched
			// Just continue with empty notes
			sale.Notes = []*domain.Note{}
		} else {
			sale.Notes = notes
		}
	} else {
		sale.Notes = []*domain.Note{}
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

func (r *Repository) GetPendingSalesOrderedByClient() ([]*ports.PendingSale, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	rows, err := r.Queries.GetPendingSalesOrderedByClient(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]*ports.PendingSale, len(rows))
	for i, row := range rows {
		result[i] = &ports.PendingSale{
			ID:             row.ID,
			Description:    row.Description,
			Amount:         row.Amount,
			Date:           row.Date.Format("2006-01-02"),
			ClientID:       row.ClientID,
			ClientName:     row.ClientName,
			ClientLastname: row.ClientLastname,
		}
	}

	return result, nil
}
