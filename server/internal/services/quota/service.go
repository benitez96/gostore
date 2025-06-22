package quota

import (
	"time"

	"github.com/benitez96/gostore/internal/ports"
	stateUpdater "github.com/benitez96/gostore/internal/services/state-updater"
)

// Make sure Service implements ports.QuotaService
// at compile time
var _ ports.QuotaService = &Service{}

type Service struct {
	Repo         ports.QuotaRepository
	StateUpdater *stateUpdater.Service
}

func (s *Service) Update(quotaID string, amount float64, dueDate time.Time) error {
	// Actualizar la cuota
	if err := s.Repo.Update(quotaID, amount, dueDate); err != nil {
		return err
	}

	// Actualizar estados y propagar cambios
	return s.StateUpdater.UpdateQuotaStateAndPropagate(quotaID)
}
