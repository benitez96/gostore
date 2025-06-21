package note

import (
	"github.com/benitez96/gostore/internal/domain"
)

func (s *Service) Create(content string, saleID string) (*domain.Note, error) {
	return s.Repo.Create(content, saleID)
}
