package ports

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/dto"
)

// PendingSale representa una venta pendiente con datos básicos del cliente
type PendingSale struct {
	ID             int64   `json:"id"`
	Description    string  `json:"description"`
	Amount         float64 `json:"amount"`
	Date           string  `json:"date"`
	ClientID       int64   `json:"client_id"`
	ClientName     string  `json:"client_name"`
	ClientLastname string  `json:"client_lastname"`
}

type SaleService interface {
	Create(dto *dto.CreateSaleDto) (int64, error)
	GetByID(id string) (sale *domain.Sale, err error)
	GetByClientID(id string) (sale []*domain.SaleSummary, err error)
	GetPendingSalesOrderedByClient() ([]*PendingSale, error)
	Delete(saleID string) error
}

type SaleRepository interface {
	CreateSaleWithProductsAndQuotas(dto *dto.CreateSaleDto) (int64, error)
	GetByID(id string) (sale *domain.Sale, err error)
	GetByClientID(id string) (sale []*domain.SaleSummary, err error)
	GetPendingSalesOrderedByClient() ([]*PendingSale, error)
	UpdatePaymentStatus(saleID string, isPaid bool, stateID int) error
	Delete(saleID string) error
}
