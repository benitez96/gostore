package product

import (
	"github.com/benitez96/gostore/internal/domain"
)

func (s *Service) GetAll() ([]*domain.Product, error) {
	return s.Repo.GetAll()
}

func (s *Service) GetPaginated(limit, offset int, search string) (*domain.Paginated[*domain.Product], error) {
	return s.Repo.GetPaginated(limit, offset, search)
}

func (s *Service) GetStats() (*domain.ProductStats, error) {
	return s.Repo.GetStats()
}
