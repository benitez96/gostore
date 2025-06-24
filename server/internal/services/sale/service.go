package sale

import (
	"github.com/benitez96/gostore/internal/ports"
	stateUpdater "github.com/benitez96/gostore/internal/services/state-updater"
)

// Make sure Service implements the ClientService interface
// at compile time.
var _ ports.SaleService = &Service{}

// Service is a struct that represents the service for the league entity.
type Service struct {
	Sr           ports.SaleRepository
	Spr          ports.SaleProductRepository
	Qr           ports.QuotaRepository
	Pr           ports.PaymentRepository
	ClientRepo   ports.ClientRepository
	StateUpdater *stateUpdater.Service
}

func NewService(sr ports.SaleRepository, spr ports.SaleProductRepository, qr ports.QuotaRepository, pr ports.PaymentRepository, clientRepo ports.ClientRepository, stateUpdater *stateUpdater.Service) *Service {
	return &Service{
		Sr:           sr,
		Spr:          spr,
		Qr:           qr,
		Pr:           pr,
		ClientRepo:   clientRepo,
		StateUpdater: stateUpdater,
	}
}

func (s *Service) GetPendingSalesOrderedByClient() ([]*ports.PendingSale, error) {
	return s.Sr.GetPendingSalesOrderedByClient()
}
