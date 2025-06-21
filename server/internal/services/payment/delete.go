package payment

import (
	"fmt"
	"time"
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
	stateID := determineQuotaState(quota.DueDate)

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
			if err := s.SaleRepo.UpdatePaymentStatus(saleID, false, 2); err != nil { // Set to warning state
				return err
			}
		}
	}

	return nil
}

// Helper function to determine quota state based on due date
func determineQuotaState(dueDate *time.Time) int {
	if dueDate == nil {
		return 1 // Default to OK if no due date
	}

	now := time.Now()
	monthsPast := int(now.Sub(*dueDate).Hours() / 24 / 30)

	if monthsPast >= 2 {
		return 3 // Suspended - past 2 months
	} else if monthsPast >= 1 {
		return 2 // Warning - past 1 month
	}
	return 1 // OK - not past due
}
