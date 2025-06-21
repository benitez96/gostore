package repositories

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) GetBySaleID(saleID string) ([]*domain.Note, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedSaleID, err := utils.ParseToInt64(saleID)
	if err != nil {
		return nil, err
	}

	notes, err := r.Queries.GetNotesBySaleID(ctx, parsedSaleID)
	if err != nil {
		return nil, err
	}

	var domainNotes []*domain.Note
	for _, note := range notes {
		domainNotes = append(domainNotes, &domain.Note{
			ID:        note.ID,
			Content:   note.Content,
			CreatedAt: note.CreatedAt,
			UpdatedAt: note.UpdatedAt,
		})
	}

	return domainNotes, nil
}
