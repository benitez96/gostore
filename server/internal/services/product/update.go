package product

import (
	"errors"

	"github.com/benitez96/gostore/internal/domain"
)

func (s *Service) Update(id string, name string, cost, price float64, stock int) (*domain.Product, error) {
	// Validation logic
	if id == "" {
		return nil, errors.New("product ID is required")
	}

	if name == "" {
		return nil, errors.New("name is required")
	}

	if stock < 0 {
		return nil, errors.New("stock cannot be negative")
	}

	return s.Repo.Update(id, name, cost, price, stock)
}
