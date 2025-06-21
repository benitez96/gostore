package payment

import (
	"fmt"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/utils"
)

func (s *Service) Create(payment *domain.Payment) error {
	// Create the payment
	if err := s.Repo.Create(payment); err != nil {
		return err
	}

	// Get all payments for this quota to calculate total paid
	quotaIDStr := fmt.Sprintf("%d", payment.QuotaID)
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

	if isPaid := totalPaid >= quota.Amount; isPaid {
		if err := s.QuotaRepo.UpdatePaymentStatus(quotaIDStr, isPaid, domain.StateOK); err != nil {
			return err
		}

		// Check if this is the last quota being paid
		// Get all quotas for this sale
		quotas, err := s.QuotaRepo.GetBySaleID(quota.SaleID.(string))
		if err != nil {
			return err
		}

		// Check if all quotas are paid
		allQuotasPaid := true
		for _, q := range quotas {
			if !q.IsPaid {
				allQuotasPaid = false
				break
			}
		}

		// If all quotas are paid, update the sale status
		if allQuotasPaid {
			saleID := quota.SaleID.(string)
			if err := s.SaleRepo.UpdatePaymentStatus(saleID, true, domain.StateOK); err != nil {
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
