package payment

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/ports"
	stateUpdater "github.com/benitez96/gostore/internal/services/state-updater"
)

// Make sure Service implements ports.PaymentService
// at compile time
var _ ports.PaymentService = &Service{}

type Service struct {
	Repo         ports.PaymentRepository
	QuotaRepo    ports.QuotaRepository
	SaleRepo     ports.SaleRepository
	ClientRepo   ports.ClientRepository
	StateUpdater *stateUpdater.Service
}

// GetByID obtiene un payment por su ID
func (s *Service) GetByID(paymentID string) (*domain.Payment, error) {
	return s.Repo.GetByID(paymentID)
}
