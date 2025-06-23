package pdf

import (
	"fmt"
	"log"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/ports"
)

// Service es el servicio principal de PDF que coordina todos los componentes
type Service struct {
	generator      *ReportGenerator
	paymentService ports.PaymentService
	quotaService   ports.QuotaService
	clientService  ports.ClientService
	saleService    ports.SaleService
}

// NewService crea una nueva instancia del servicio de PDF
func NewService(
	paymentService ports.PaymentService,
	quotaService ports.QuotaService,
	clientService ports.ClientService,
	saleService ports.SaleService,
) *Service {
	// Crear componentes
	templateManager := NewTemplateManager()
	config := DefaultReportConfig()
	converter := NewPDFConverter("/tmp", config)
	generator := NewReportGenerator(templateManager, converter)

	return &Service{
		generator:      generator,
		paymentService: paymentService,
		quotaService:   quotaService,
		clientService:  clientService,
		saleService:    saleService,
	}
}

// GeneratePaymentReceipt genera un comprobante de pago en PDF
func (s *Service) GeneratePaymentReceipt(payment *domain.Payment, client *domain.Client, quota *domain.Quota, sale *domain.Sale) ([]byte, error) {
	return s.generator.GeneratePaymentReceipt(payment, client, quota, sale)
}

// GeneratePaymentReceiptFromID genera un comprobante de pago en PDF a partir del ID del pago
func (s *Service) GeneratePaymentReceiptFromID(paymentID string) ([]byte, error) {
	// Obtener el payment desde la base de datos
	payment, err := s.paymentService.GetByID(paymentID)
	if err != nil {
		log.Printf("Error getting payment: %v", err)
		return nil, fmt.Errorf("error getting payment: %w", err)
	}

	log.Printf("Payment found: ID=%d, Amount=%.2f, QuotaID=%d", payment.ID, payment.Amount, payment.QuotaID)

	// Obtener la quota desde la base de datos
	quota, err := s.quotaService.GetByID(fmt.Sprintf("%d", payment.QuotaID))
	if err != nil {
		log.Printf("Error getting quota: %v", err)
		return nil, fmt.Errorf("error getting quota: %w", err)
	}

	log.Printf("Quota found: ID=%v, Number=%d, ClientID=%v, SaleID=%v", quota.ID, quota.Number, quota.ClientID, quota.SaleID)

	// Obtener el client desde la base de datos
	clientIDStr, ok := quota.ClientID.(string)
	if !ok {
		return nil, fmt.Errorf("invalid client ID type")
	}

	client, err := s.clientService.Get(clientIDStr)
	if err != nil {
		log.Printf("Error getting client: %v", err)
		return nil, fmt.Errorf("error getting client: %w", err)
	}

	log.Printf("Client found: ID=%s, Name=%s %s", clientIDStr, client.Name, client.Lastname)

	// Obtener la sale desde la base de datos
	saleIDStr, ok := quota.SaleID.(string)
	if !ok {
		return nil, fmt.Errorf("invalid sale ID type")
	}

	sale, err := s.saleService.GetByID(saleIDStr)
	if err != nil {
		log.Printf("Error getting sale: %v", err)
		return nil, fmt.Errorf("error getting sale: %w", err)
	}

	log.Printf("Sale found: ID=%s, Description=%s", saleIDStr, sale.Description)

	// Generar el PDF
	pdfContent, err := s.GeneratePaymentReceipt(payment, client, quota, sale)
	if err != nil {
		log.Printf("Error generating PDF: %v", err)
		return nil, err
	}

	log.Printf("PDF generated successfully, size: %d bytes", len(pdfContent))
	return pdfContent, nil
}

// GenerateDuplicate genera un duplicado del comprobante
func (s *Service) GenerateDuplicate(paymentID string) ([]byte, error) {
	return s.generator.GenerateDuplicate(paymentID)
}

// TODO: Agregar métodos para otros tipos de reportes
// - GenerateSalesReport
// - GenerateClientReport
// - GenerateInventoryReport
// - GenerateFinancialReport
