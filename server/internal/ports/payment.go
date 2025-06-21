package ports

import (
	"github.com/benitez96/gostore/internal/domain"
)

type PaymentRepository interface {
	GetByQuotaID(quotaID string) ([]*domain.Payment, error)
	GetByID(paymentID string) (*domain.Payment, error)
	Create(payment *domain.Payment) error
	Delete(paymentID string) error
}

type PaymentService interface {
	Create(payment *domain.Payment) error
	Delete(paymentID string) error
}
