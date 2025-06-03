package ports

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/dto"
	// "github.com/benitez96/gostore/internal/dto"
)

type SaleService interface {
	Create(dto *dto.CreateSaleDto) (int64, error)
	// GetByID(id string) (sale []*domain.Sale, err error)
	GetByClientID(id string) (sale []*domain.SaleSummary, err error)
}

type SaleRepository interface {
	CreateSaleWithProductsAndQuotas(dto *dto.CreateSaleDto) (int64, error)
	GetByClientID(id string) (sale []*domain.SaleSummary, err error)
}
