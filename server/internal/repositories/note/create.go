package repositories

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) Create(content string, saleID string) (*domain.Note, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedSaleID, err := utils.ParseToInt64(saleID)
	if err != nil {
		return nil, err
	}

	note, err := r.Queries.CreateNote(ctx, sqlc.CreateNoteParams{
		Content: content,
		SaleID:  parsedSaleID,
	})
	if err != nil {
		return nil, err
	}

	return &domain.Note{
		ID:        note.ID,
		Content:   note.Content,
		CreatedAt: note.CreatedAt,
		UpdatedAt: note.UpdatedAt,
	}, nil
}
