package note

import (
	"github.com/benitez96/gostore/internal/domain"
)

func (s *Service) GetBySaleID(saleID string) ([]*domain.Note, error) {
	return s.Repo.GetBySaleID(saleID)
}
