package pdf

import (
	"fmt"
	"strings"
	"time"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/ports"
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

// GenerateSaleSheet genera la ficha de venta en PDF
type SaleSheetData struct {
	ClientName     string
	ClientLastname string
	ClientInitials string
	ClientDni      string
	ClientEmail    string
	ClientPhone    string
	SaleDate       string
	ProductDesc    string
	NumQuotas      int
	QuotaPrice     float64
	Quotas         []QuotaRow
}

type QuotaRow struct {
	Number  int
	IsPaid  bool
	PayDate string
	Amount  float64
}

// getSaleAndClient obtiene la venta y el cliente asociados al saleID
func getSaleAndClient(saleID int, saleService ports.SaleService, clientService ports.ClientService) (*domain.Sale, *domain.Client, error) {
	sale, err := saleService.GetByID(fmt.Sprintf("%d", saleID))
	if err != nil {
		return nil, nil, fmt.Errorf("error obteniendo venta: %w", err)
	}

	// Convertir ClientID a string, manejando diferentes tipos
	var clientIDStr string
	switch v := sale.ClientID.(type) {
	case string:
		clientIDStr = v
	case int:
		clientIDStr = fmt.Sprintf("%d", v)
	case int64:
		clientIDStr = fmt.Sprintf("%d", v)
	case float64:
		clientIDStr = fmt.Sprintf("%.0f", v)
	default:
		return nil, nil, fmt.Errorf("tipo de clientID no soportado: %T", sale.ClientID)
	}

	client, err := clientService.Get(clientIDStr)
	if err != nil {
		return nil, nil, fmt.Errorf("error obteniendo cliente: %w", err)
	}
	return sale, client, nil
}

// Modificar GenerateSaleSheetPDF para recibir los servicios
func (rg *ReportGenerator) GenerateSaleSheetPDF(saleID int, saleService ports.SaleService, clientService ports.ClientService) ([]byte, error) {
	sale, client, err := getSaleAndClient(saleID, saleService, clientService)
	if err != nil {
		return nil, err
	}

	// Preparar datos para la plantilla
	data := SaleSheetData{
		ClientName:     client.Name,
		ClientLastname: client.Lastname,
		ClientInitials: getInitials(client.Lastname),
		ClientDni:      dashIfEmpty(client.Dni),
		ClientEmail:    dashIfEmpty(client.Email),
		ClientPhone:    dashIfEmpty(client.Phone),
		SaleDate:       formatDate(sale.Date),
		ProductDesc:    sale.Description,
		NumQuotas:      len(sale.Quotas),
		QuotaPrice:     sale.Amount,
	}
	for _, q := range sale.Quotas {
		row := QuotaRow{
			Number: int(q.Number),
			IsPaid: q.IsPaid,
			PayDate: func() string {
				if q.IsPaid && len(q.Payments) > 0 && q.Payments[0].Date != nil {
					return formatDate(q.Payments[0].Date)
				}
				return ""
			}(),
			Amount: q.Amount,
		}
		data.Quotas = append(data.Quotas, row)
	}

	htmlContent, err := rg.templateManager.GenerateSaleSheetHTML(data)
	if err != nil {
		return nil, err
	}
	return rg.converter.ConvertHTMLToPDF(htmlContent)
}

func dashIfEmpty(s string) string {
	if s == "" {
		return "-"
	}
	return s
}

func formatDate(t *time.Time) string {
	if t == nil {
		return "-"
	}
	return t.Format("02/01/2006")
}

func getInitials(lastname string) string {
	if lastname == "" {
		return "--"
	}
	if len(lastname) < 2 {
		return strings.ToUpper(lastname)
	}
	return strings.ToUpper(lastname[:2])
}

// TODO: Agregar más métodos para otros tipos de reportes cuando se necesiten
// - GenerateSalesReport
// - GenerateClientReport
// - GenerateInventoryReport
// - GenerateFinancialReport
