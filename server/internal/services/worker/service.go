package worker

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

type Service struct {
	Queries *sqlc.Queries
}

// QuotaStateUpdate representa una actualización de estado de cuota
type QuotaStateUpdate struct {
	ID      int64
	StateID int64
}

// SaleStateUpdate representa una actualización de estado de venta
type SaleStateUpdate struct {
	ID      int64
	StateID int64
}

// ClientStateUpdate representa una actualización de estado de cliente
type ClientStateUpdate struct {
	ID      int64
	StateID int64
}

// RunStateUpdateWorker ejecuta el worker de actualización de estados
func (s *Service) RunStateUpdateWorker(ctx context.Context) {
	log.Println("🚀 Starting state update worker...")

	// Ejecutar inmediatamente al iniciar
	s.updateStates()

	// Configurar ticker para ejecutar cada 24 horas
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("🛑 State update worker stopped")
			return
		case <-ticker.C:
			log.Println("⏰ Running scheduled state update...")
			s.updateStates()
		}
	}
}

// UpdateStates actualiza los estados de cuotas, ventas y clientes
func (s *Service) UpdateStates() {
	start := time.Now()
	log.Println("🔄 Starting state update process...")

	// Actualizar estados de cuotas
	quotaUpdates, err := s.updateQuotaStates()
	if err != nil {
		log.Printf("❌ Error updating quota states: %v", err)
		return
	}

	// Actualizar estados de ventas
	saleUpdates, err := s.updateSaleStates()
	if err != nil {
		log.Printf("❌ Error updating sale states: %v", err)
		return
	}

	// Actualizar estados de clientes
	clientUpdates, err := s.updateClientStates()
	if err != nil {
		log.Printf("❌ Error updating client states: %v", err)
		return
	}

	duration := time.Since(start)
	log.Printf("✅ State update completed in %v", duration)
	log.Printf("📊 Updated: %d quotas, %d sales, %d clients",
		len(quotaUpdates), len(saleUpdates), len(clientUpdates))
}

// updateStates actualiza los estados de cuotas, ventas y clientes (método privado para uso interno)
func (s *Service) updateStates() {
	s.UpdateStates()
}

// updateQuotaStates actualiza los estados de las cuotas no pagadas
func (s *Service) updateQuotaStates() ([]QuotaStateUpdate, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	// Obtener todas las cuotas no pagadas
	quotas, err := s.Queries.GetUnpaidQuotasForStateUpdate(ctx)
	if err != nil {
		return nil, err
	}

	var updates []QuotaStateUpdate

	// Procesar cuotas en paralelo usando goroutines
	var wg sync.WaitGroup
	updateChan := make(chan QuotaStateUpdate, len(quotas))

	for _, quota := range quotas {
		wg.Add(1)
		go func(q sqlc.GetUnpaidQuotasForStateUpdateRow) {
			defer wg.Done()

			// Determinar el nuevo estado basado en la fecha de vencimiento
			newStateID := s.determineQuotaState(q.DueDate)

			// Solo actualizar si el estado cambió
			if int64(newStateID) != q.StateID {
				updateChan <- QuotaStateUpdate{
					ID:      q.ID,
					StateID: int64(newStateID),
				}
			}
		}(quota)
	}

	// Esperar a que todas las goroutines terminen
	go func() {
		wg.Wait()
		close(updateChan)
	}()

	// Recolectar actualizaciones
	for update := range updateChan {
		updates = append(updates, update)
	}

	// Aplicar actualizaciones en lotes
	if len(updates) > 0 {
		for _, update := range updates {
			err := s.Queries.UpdateQuotaStateBulk(ctx, sqlc.UpdateQuotaStateBulkParams{
				StateID: update.StateID,
				ID:      update.ID,
			})
			if err != nil {
				log.Printf("❌ Error updating quota %d: %v", update.ID, err)
			}
		}
	}

	return updates, nil
}

// updateSaleStates actualiza los estados de las ventas basándose en sus cuotas
func (s *Service) updateSaleStates() ([]SaleStateUpdate, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	// Obtener ventas que tienen cuotas no pagadas
	sales, err := s.Queries.GetSalesByQuotaStates(ctx)
	if err != nil {
		return nil, err
	}

	var updates []SaleStateUpdate

	// Procesar ventas en paralelo
	var wg sync.WaitGroup
	updateChan := make(chan SaleStateUpdate, len(sales))

	for _, sale := range sales {
		wg.Add(1)
		go func(saleRow sqlc.GetSalesByQuotaStatesRow) {
			defer wg.Done()

			// Obtener todas las cuotas de esta venta
			quotas, err := s.Queries.GetSaleQuotas(ctx, saleRow.ID)
			if err != nil {
				log.Printf("❌ Error getting quotas for sale %d: %v", saleRow.ID, err)
				return
			}

			// Determinar el estado de la venta basándose en sus cuotas
			newStateID := s.determineSaleState(quotas)

			// Solo actualizar si el estado cambió
			if newStateID != saleRow.StateID {
				updateChan <- SaleStateUpdate{
					ID:      saleRow.ID,
					StateID: newStateID,
				}
			}
		}(sale)
	}

	// Esperar a que todas las goroutines terminen
	go func() {
		wg.Wait()
		close(updateChan)
	}()

	// Recolectar actualizaciones
	for update := range updateChan {
		updates = append(updates, update)
	}

	// Aplicar actualizaciones
	if len(updates) > 0 {
		for _, update := range updates {
			err := s.Queries.UpdateSaleStateBulk(ctx, sqlc.UpdateSaleStateBulkParams{
				StateID: update.StateID,
				ID:      update.ID,
			})
			if err != nil {
				log.Printf("❌ Error updating sale %d: %v", update.ID, err)
			}
		}
	}

	return updates, nil
}

// updateClientStates actualiza los estados de los clientes basándose en sus ventas
func (s *Service) updateClientStates() ([]ClientStateUpdate, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	// Obtener clientes que tienen ventas no pagadas
	clients, err := s.Queries.GetClientsBySaleStates(ctx)
	if err != nil {
		return nil, err
	}

	var updates []ClientStateUpdate

	// Procesar clientes en paralelo
	var wg sync.WaitGroup
	updateChan := make(chan ClientStateUpdate, len(clients))

	for _, client := range clients {
		wg.Add(1)
		go func(clientRow sqlc.GetClientsBySaleStatesRow) {
			defer wg.Done()

			// Obtener todas las ventas de este cliente
			sales, err := s.Queries.GetSalesByClientID(ctx, clientRow.ID)
			if err != nil {
				log.Printf("❌ Error getting sales for client %d: %v", clientRow.ID, err)
				return
			}

			// Determinar el estado del cliente basándose en sus ventas
			newStateID := s.determineClientState(sales)

			// Solo actualizar si el estado cambió
			if newStateID != clientRow.StateID {
				updateChan <- ClientStateUpdate{
					ID:      clientRow.ID,
					StateID: newStateID,
				}
			}
		}(client)
	}

	// Esperar a que todas las goroutines terminen
	go func() {
		wg.Wait()
		close(updateChan)
	}()

	// Recolectar actualizaciones
	for update := range updateChan {
		updates = append(updates, update)
	}

	// Aplicar actualizaciones
	if len(updates) > 0 {
		for _, update := range updates {
			err := s.Queries.UpdateClientStateBulk(ctx, sqlc.UpdateClientStateBulkParams{
				StateID: update.StateID,
				ID:      update.ID,
			})
			if err != nil {
				log.Printf("❌ Error updating client %d: %v", update.ID, err)
			}
		}
	}

	return updates, nil
}

// determineQuotaState determina el estado de una cuota basándose en su fecha de vencimiento
func (s *Service) determineQuotaState(dueDate time.Time) int {
	now := time.Now()
	monthsPast := int(now.Sub(dueDate).Hours() / 24 / 30)

	if monthsPast >= 2 {
		return domain.StateSuspended // Suspended - past 2 months
	}
	if monthsPast >= 1 {
		return domain.StateWarning // Warning - past 1 month
	}
	return domain.StateOK // OK - not past due
}

// determineSaleState determina el estado de una venta basándose en sus cuotas
func (s *Service) determineSaleState(quotas []sqlc.Quota) int64 {
	if len(quotas) == 0 {
		return domain.StateOK
	}

	// Buscar el peor estado entre todas las cuotas no pagadas
	hasState3 := false
	hasState2 := false

	for _, quota := range quotas {
		if !quota.IsPaid.Bool {
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

// determineClientState determina el estado de un cliente basándose en sus ventas
func (s *Service) determineClientState(sales []sqlc.GetSalesByClientIDRow) int64 {
	if len(sales) == 0 {
		return domain.StateOK
	}

	// Buscar el peor estado entre todas las ventas
	hasState3 := false
	hasState2 := false

	for _, sale := range sales {
		switch sale.StateID {
		case domain.StateSuspended:
			hasState3 = true
		case domain.StateWarning:
			hasState2 = true
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
