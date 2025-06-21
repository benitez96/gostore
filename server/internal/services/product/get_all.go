package product

import (
	"github.com/benitez96/gostore/internal/domain"
)

func (s *Service) GetAll() ([]*domain.Product, error) {
	return s.Repo.GetAll()
}
