package sale

import "github.com/benitez96/gostore/internal/ports"

// Make sure Service implements the ClientService interface
// at compile time.
var _ ports.SaleService = &Service{}

// Service is a struct that represents the service for the league entity.
type Service struct {
	Repo ports.SaleRepository
}
