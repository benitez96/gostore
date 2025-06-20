package ports

import (
	"github.com/benitez96/gostore/internal/domain"
)

type SaleProductRepository interface {
	GetBySaleID(saleID string) ([]*domain.SaleProduct, error)
}
