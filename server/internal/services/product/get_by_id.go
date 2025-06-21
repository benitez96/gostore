package product

import (
	"errors"

	"github.com/benitez96/gostore/internal/domain"
)

func (s *Service) GetByID(id string) (*domain.Product, error) {
	// Validation logic
	if id == "" {
		return nil, errors.New("product ID is required")
	}

	return s.Repo.GetByID(id)
}
