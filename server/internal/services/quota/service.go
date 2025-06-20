package quota

import (
	"time"

	"github.com/benitez96/gostore/internal/ports"
)

// Make sure Service implements ports.QuotaService
// at compile time
var _ ports.QuotaService = &Service{}

type Service struct {
	Repo ports.QuotaRepository
}

func (s *Service) Update(quotaID string, amount float64, dueDate time.Time) error {
	return s.Repo.Update(quotaID, amount, dueDate)
}
