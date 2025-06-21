package payment

import (
	"github.com/benitez96/gostore/internal/ports"
)

// Make sure Service implements ports.PaymentService
// at compile time
var _ ports.PaymentService = &Service{}

type Service struct {
	Repo       ports.PaymentRepository
	QuotaRepo  ports.QuotaRepository
	SaleRepo   ports.SaleRepository
	ClientRepo ports.ClientRepository
}
