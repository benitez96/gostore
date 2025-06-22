package state_updater

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/ports"
	"github.com/benitez96/gostore/internal/utils"
)

type Service struct {
	QuotaRepo   ports.QuotaRepository
	SaleRepo    ports.SaleRepository
	ClientRepo  ports.ClientRepository
	PaymentRepo ports.PaymentRepository
}

// UpdateQuotaStateAndPropagate actualiza el estado de una cuota y propaga los cambios
func (s *Service) UpdateQuotaStateAndPropagate(quotaID string) error {
	// Obtener la cuota
	quota, err := s.QuotaRepo.GetByID(quotaID)
	if err != nil {
		return err
	}

	// Calcular si la cuota está pagada
	isPaid, err := s.calculateQuotaPaymentStatus(quotaID)
	if err != nil {
		return err
	}

	// Determinar el nuevo estado basado en la fecha de vencimiento
	newStateID := utils.DetermineQuotaState(quota.DueDate)

	// Actualizar el estado de la cuota
	if err := s.QuotaRepo.UpdatePaymentStatus(quotaID, isPaid, newStateID); err != nil {
		return err
	}

	// Propagar cambios a la venta
	if err := s.updateSaleState(quota.SaleID.(string)); err != nil {
		return err
	}

	// Propagar cambios al cliente
	if err := s.updateClientState(quota.ClientID.(string)); err != nil {
		return err
	}

	return nil
}

// calculateQuotaPaymentStatus calcula si una cuota está completamente pagada
func (s *Service) calculateQuotaPaymentStatus(quotaID string) (bool, error) {
	// Obtener todos los pagos de la cuota
	payments, err := s.PaymentRepo.GetByQuotaID(quotaID)
	if err != nil {
		return false, err
	}

	// Calcular el total pagado
	totalPaid := 0.0
	for _, payment := range payments {
		totalPaid += payment.Amount
	}

	// Obtener la cuota para verificar el monto requerido
	quota, err := s.QuotaRepo.GetByID(quotaID)
	if err != nil {
		return false, err
	}

	// La cuota está pagada si el total pagado es mayor o igual al monto requerido
	return totalPaid >= quota.Amount, nil
}

// UpdateSaleStateAndPropagate actualiza el estado de una venta y propaga los cambios
func (s *Service) UpdateSaleStateAndPropagate(saleID string) error {
	// Obtener todas las cuotas de la venta
	quotas, err := s.QuotaRepo.GetBySaleID(saleID)
	if err != nil {
		return err
	}

	// Determinar el estado de la venta basándose en sus cuotas
	newStateID := s.determineSaleState(quotas)

	// Verificar si todas las cuotas están pagadas
	allQuotasPaid := true
	for _, quota := range quotas {
		if !quota.IsPaid {
			allQuotasPaid = false
			break
		}
	}

	// Actualizar el estado de la venta
	if err := s.SaleRepo.UpdatePaymentStatus(saleID, allQuotasPaid, newStateID); err != nil {
		return err
	}

	// Propagar cambios al cliente
	sale, err := s.SaleRepo.GetByID(saleID)
	if err != nil {
		return err
	}

	if err := s.updateClientState(sale.ClientID.(string)); err != nil {
		return err
	}

	return nil
}

// UpdateClientState actualiza el estado de un cliente
func (s *Service) UpdateClientState(clientID string) error {
	return s.updateClientState(clientID)
}

// updateSaleState actualiza el estado de una venta basándose en sus cuotas
func (s *Service) updateSaleState(saleID string) error {
	// Obtener todas las cuotas de la venta
	quotas, err := s.QuotaRepo.GetBySaleID(saleID)
	if err != nil {
		return err
	}

	// Determinar el estado de la venta basándose en sus cuotas
	newStateID := s.determineSaleState(quotas)

	// Verificar si todas las cuotas están pagadas
	allQuotasPaid := true
	for _, quota := range quotas {
		if !quota.IsPaid {
			allQuotasPaid = false
			break
		}
	}

	// Actualizar el estado de la venta
	return s.SaleRepo.UpdatePaymentStatus(saleID, allQuotasPaid, newStateID)
}

// updateClientState actualiza el estado de un cliente basándose en sus ventas
func (s *Service) updateClientState(clientID string) error {
	// Obtener todas las ventas del cliente
	sales, err := s.SaleRepo.GetByClientID(clientID)
	if err != nil {
		return err
	}

	// Determinar el estado del cliente basándose en sus ventas
	newStateID := utils.DetermineClientState(sales)

	// Actualizar el estado del cliente
	return s.ClientRepo.UpdateState(clientID, newStateID)
}

// determineSaleState determina el estado de una venta basándose en sus cuotas
func (s *Service) determineSaleState(quotas []*domain.Quota) int {
	if len(quotas) == 0 {
		return domain.StateOK
	}

	// Buscar el peor estado entre todas las cuotas no pagadas
	hasState3 := false
	hasState2 := false

	for _, quota := range quotas {
		if !quota.IsPaid {
			switch quota.StateID {
			case domain.StateSuspended:
				hasState3 = true
			case domain.StateWarning:
				hasState2 = true
			}
		}
	}

	// Prioridad: State 3 > State 2 > State 1
	if hasState3 {
		return domain.StateSuspended
	}
	if hasState2 {
		return domain.StateWarning
	}
	return domain.StateOK
}
