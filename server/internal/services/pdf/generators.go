package pdf

import (
	"fmt"
	"time"

	"github.com/benitez96/gostore/internal/domain"
)

// ReportGenerator maneja la generación de diferentes tipos de reportes
type ReportGenerator struct {
	templateManager *TemplateManager
	converter       *PDFConverter
}

// NewReportGenerator crea una nueva instancia del generador de reportes
func NewReportGenerator(templateManager *TemplateManager, converter *PDFConverter) *ReportGenerator {
	return &ReportGenerator{
		templateManager: templateManager,
		converter:       converter,
	}
}

// GeneratePaymentReceipt genera un comprobante de pago en PDF
func (rg *ReportGenerator) GeneratePaymentReceipt(payment *domain.Payment, client *domain.Client, quota *domain.Quota, sale *domain.Sale) ([]byte, error) {
	// Usar fecha actual si payment.Date es nil
	paymentDate := time.Now()
	if payment.Date != nil {
		paymentDate = *payment.Date
	}

	// Preparar datos para el template
	data := PaymentReceiptData{
		BaseData: BaseData{
			GeneratedAt: time.Now(),
			ReportType:  "payment_receipt",
		},
		PaymentID:       payment.ID,
		Amount:          payment.Amount,
		Date:            paymentDate,
		ClientName:      fmt.Sprintf("%s %s", client.Name, client.Lastname),
		ClientDni:       client.Dni,
		QuotaNumber:     int(quota.Number),
		SaleID:          payment.ID,
		SaleDescription: sale.Description,
		ReceiptNumber:   fmt.Sprintf("R-%d-%d", payment.ID, time.Now().Unix()),
	}

	// Generar HTML
	htmlContent, err := rg.templateManager.GeneratePaymentReceiptHTML(data)
	if err != nil {
		return nil, fmt.Errorf("error generating HTML: %w", err)
	}

	// Convertir HTML a PDF
	pdfContent, err := rg.converter.ConvertHTMLToPDF(htmlContent)
	if err != nil {
		return nil, fmt.Errorf("error converting to PDF: %w", err)
	}

	return pdfContent, nil
}

// GenerateDuplicate genera un duplicado del comprobante
func (rg *ReportGenerator) GenerateDuplicate(paymentID string) ([]byte, error) {
	// TODO: Implementar generación de duplicado
	// Por ahora retornamos un error
	return nil, fmt.Errorf("duplicate generation not implemented yet")
}

// TODO: Agregar más métodos para otros tipos de reportes cuando se necesiten
// - GenerateSalesReport
// - GenerateClientReport
// - GenerateInventoryReport
// - GenerateFinancialReport
