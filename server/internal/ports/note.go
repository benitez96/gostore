package ports

import (
	"github.com/benitez96/gostore/internal/domain"
)

type NoteService interface {
	Create(content string, saleID string) (*domain.Note, error)
	GetBySaleID(saleID string) ([]*domain.Note, error)
}

type NoteRepository interface {
	Create(content string, saleID string) (*domain.Note, error)
	GetBySaleID(saleID string) ([]*domain.Note, error)
}
