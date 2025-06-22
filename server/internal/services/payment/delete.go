package payment

import (
	"fmt"
)

func (s *Service) Delete(paymentID string) error {
	// First, get the payment to know which quota it belongs to
	payment, err := s.Repo.GetByID(paymentID)
	if err != nil {
		return err
	}

	// Get the quota ID from the payment
	quotaIDStr := fmt.Sprintf("%d", payment.QuotaID)

	// Delete the payment
	if err := s.Repo.Delete(paymentID); err != nil {
		return err
	}

	// Actualizar estados y propagar cambios
	return s.StateUpdater.UpdateQuotaStateAndPropagate(quotaIDStr)
}
