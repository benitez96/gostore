package ports

import (
	"github.com/benitez96/gostore/internal/domain"
)

type ProductService interface {
	Create(name string, cost, price float64, stock int) (*domain.Product, error)
	GetAll() ([]*domain.Product, error)
	GetPaginated(limit, offset int, search string) (*domain.Paginated[*domain.Product], error)
	GetStats() (*domain.ProductStats, error)
	GetByID(id string) (*domain.Product, error)
	Update(id string, name string, cost, price float64, stock int) (*domain.Product, error)
	Delete(id string) error
}

type ProductRepository interface {
	Create(name string, cost, price float64, stock int) (*domain.Product, error)
	GetAll() ([]*domain.Product, error)
	GetPaginated(limit, offset int, search string) (*domain.Paginated[*domain.Product], error)
	GetStats() (*domain.ProductStats, error)
	GetByID(id string) (*domain.Product, error)
	Update(id string, name string, cost, price float64, stock int) (*domain.Product, error)
	Delete(id string) error
}
