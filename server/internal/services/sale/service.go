package sale

import "github.com/benitez96/gostore/internal/ports"

// Make sure Service implements the ClientService interface
// at compile time.
var _ ports.SaleService = &Service{}

// Service is a struct that represents the service for the league entity.
type Service struct {
	Sr 	ports.SaleRepository
	Spr	ports.SaleProductRepository
	Qr 	ports.QuotaRepository
	Pr 	ports.PaymentRepository
}
