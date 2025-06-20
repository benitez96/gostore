package ports

import (
	"time"

	"github.com/benitez96/gostore/internal/domain"
)

type QuotaRepository interface {
	GetBySaleID(saleID string) ([]*domain.Quota, error)
	GetByID(quotaID string) (*domain.Quota, error)
	UpdatePaymentStatus(quotaID string, isPaid bool, stateID int) error
	Update(quotaID string, amount float64, dueDate time.Time) error
}

type QuotaService interface {
	Update(quotaID string, amount float64, dueDate time.Time) error
}
