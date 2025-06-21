package product

import (
	"errors"

	"github.com/benitez96/gostore/internal/domain"
)

func (s *Service) Create(name string, cost, price float64, stock int) (*domain.Product, error) {
	// Validation logic
	if name == "" {
		return nil, errors.New("name is required")
	}

	if stock < 0 {
		return nil, errors.New("stock cannot be negative")
	}

	return s.Repo.Create(name, cost, price, stock)
}
