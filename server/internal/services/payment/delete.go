package payment

import (
	"fmt"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/utils"
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

	// Get all remaining payments for this quota to calculate total paid
	payments, err := s.Repo.GetByQuotaID(quotaIDStr)
	if err != nil {
		return err
	}

	// Calculate total amount paid
	totalPaid := 0.0
	for _, p := range payments {
		totalPaid += p.Amount
	}

	// Get the quota to check the required amount
	quota, err := s.QuotaRepo.GetByID(quotaIDStr)
	if err != nil {
		return err
	}

	// Check if quota is still fully paid
	isPaid := totalPaid >= quota.Amount

	// Determine state based on due date
	stateID := utils.DetermineQuotaState(quota.DueDate)

	// Update quota payment status
	if err := s.QuotaRepo.UpdatePaymentStatus(quotaIDStr, isPaid, stateID); err != nil {
		return err
	}

	// If quota is now unpaid, check if any other quotas are unpaid
	if !isPaid {
		quotas, err := s.QuotaRepo.GetBySaleID(quota.SaleID.(string))
		if err != nil {
			return err
		}

		// Check if any quotas are unpaid
		anyQuotaUnpaid := false
		for _, q := range quotas {
			if !q.IsPaid {
				anyQuotaUnpaid = true
				break
			}
		}

		// If any quota is unpaid, update the sale status
		if anyQuotaUnpaid {
			saleID := quota.SaleID.(string)
			if err := s.SaleRepo.UpdatePaymentStatus(saleID, false, domain.StateWarning); err != nil {
				return err
			}

			// Get all sales for this client to check their states
			clientSales, err := s.SaleRepo.GetByClientID(quota.ClientID.(string))
			if err != nil {
				return err
			}

			// Determine client state based on all their sales
			clientStateID := utils.DetermineClientState(clientSales)

			// Update client state
			clientID := quota.ClientID.(string)
			if err := s.ClientRepo.UpdateState(clientID, clientStateID); err != nil {
				return err
			}
		}
	}

	return nil
}
