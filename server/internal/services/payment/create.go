package payment

import (
	"fmt"

	"github.com/benitez96/gostore/internal/domain"
)

func (s *Service) Create(payment *domain.Payment) error {
	// Create the payment
	if err := s.Repo.Create(payment); err != nil {
		return err
	}

	// Get the quota ID from the payment
	quotaIDStr := fmt.Sprintf("%d", payment.QuotaID)

	// Actualizar estados y propagar cambios
	return s.StateUpdater.UpdateQuotaStateAndPropagate(quotaIDStr)
}
