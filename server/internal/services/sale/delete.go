package sale

import (
	"fmt"

	"github.com/benitez96/gostore/internal/utils"
)

func (s *Service) Delete(saleID string) error {
	// First, get the sale to know which client it belongs to
	sale, err := s.Sr.GetByID(saleID)
	if err != nil {
		return err
	}

	// Delete the sale (database will cascade delete quotas, payments, and sale_products)
	if err := s.Sr.Delete(saleID); err != nil {
		return err
	}

	// Get all remaining sales for this client to check their states
	clientSales, err := s.Sr.GetByClientID(fmt.Sprintf("%d", sale.ClientID))
	if err != nil {
		return err
	}

	// Determine client state based on remaining sales
	clientStateID := utils.DetermineClientState(clientSales)

	// Update client state
	clientID := fmt.Sprintf("%d", sale.ClientID)
	if err := s.ClientRepo.UpdateState(clientID, clientStateID); err != nil {
		return err
	}

	return nil
}
