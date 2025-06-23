package ports

import (
	"github.com/benitez96/gostore/internal/domain"
)

type PDFService interface {
	GeneratePaymentReceipt(payment *domain.Payment, client *domain.Client, quota *domain.Quota, sale *domain.Sale) ([]byte, error)
	GenerateDuplicate(paymentID string) ([]byte, error)
	GeneratePaymentReceiptFromID(paymentID string) ([]byte, error)
}
