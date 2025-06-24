package pdf

import (
	"context"
	"fmt"
	"strings"
	"sync"
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
		AmountFormatted: formatMoney(payment.Amount),
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
	ClientName          string
	ClientLastname      string
	ClientInitials      string
	ClientDni           string
	ClientEmail         string
	ClientPhone         string
	SaleDate            string
	ProductDesc         string
	NumQuotas           int
	QuotaPrice          float64
	QuotaPriceFormatted string // Monto formateado para mostrar
	Quotas              []QuotaRow
}

type QuotaRow struct {
	Number          int
	IsPaid          bool
	PayDate         string
	DueDate         string
	Amount          float64
	AmountFormatted string // Monto formateado para mostrar
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
	quotaPrice := sale.Quotas[0].Amount
	data := SaleSheetData{
		ClientName:          client.Name,
		ClientLastname:      client.Lastname,
		ClientInitials:      getInitials(client.Lastname),
		ClientDni:           dashIfEmpty(client.Dni),
		ClientEmail:         dashIfEmpty(client.Email),
		ClientPhone:         dashIfEmpty(client.Phone),
		SaleDate:            formatDate(sale.Date),
		ProductDesc:         sale.Description,
		NumQuotas:           len(sale.Quotas),
		QuotaPrice:          quotaPrice,
		QuotaPriceFormatted: formatMoney(quotaPrice),
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
			DueDate:         formatDate(q.DueDate),
			Amount:          q.Amount,
			AmountFormatted: formatMoney(q.Amount),
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

// formatMoney formatea un monto con separador de miles (punto) y decimales (coma) - formato argentino
func formatMoney(amount float64) string {
	// Convertir a string con 2 decimales
	formatted := fmt.Sprintf("%.2f", amount)

	// Separar la parte entera de los decimales
	parts := strings.Split(formatted, ".")
	integerPart := parts[0]
	decimalPart := parts[1]

	// Agregar separadores de miles (puntos) a la parte entera
	if len(integerPart) > 3 {
		var result strings.Builder
		for i, digit := range integerPart {
			if i > 0 && (len(integerPart)-i)%3 == 0 {
				result.WriteString(".")
			}
			result.WriteRune(digit)
		}
		integerPart = result.String()
	}

	// Retornar con formato argentino: separador de miles (.) y decimales (,)
	return integerPart + "," + decimalPart
}

// TODO: Agregar más métodos para otros tipos de reportes cuando se necesiten
// - GenerateSalesReport
// - GenerateClientReport
// - GenerateInventoryReport
// - GenerateFinancialReport

// WorkerResult representa el resultado de procesamiento de un worker
type WorkerResult struct {
	Index    int
	SaleData SaleEntry
	Error    error
}

// GenerateSalesBookPDFOptimized genera el libro de ventas usando un pool de workers para mejor rendimiento
func (rg *ReportGenerator) GenerateSalesBookPDFOptimized(saleService ports.SaleService, clientService ports.ClientService) ([]byte, error) {
	// Obtener todas las ventas pendientes ordenadas alfabéticamente
	pendingSales, err := saleService.GetPendingSalesOrderedByClient()
	if err != nil {
		return nil, fmt.Errorf("error obteniendo ventas pendientes: %w", err)
	}

	if len(pendingSales) == 0 {
		return nil, fmt.Errorf("no hay ventas pendientes para generar el libro")
	}

	// Configuración adaptativa basada en el número de ventas
	var config *WorkerPoolConfig
	switch {
	case len(pendingSales) < 100:
		config = SmallWorkloadConfig()
	case len(pendingSales) > 500:
		config = LargeWorkloadConfig()
	default:
		config = DefaultWorkerPoolConfig()
	}

	ctx, cancel := context.WithTimeout(context.Background(), config.Timeout)
	defer cancel()

	// Canal para enviar trabajos a los workers
	jobs := make(chan int, len(pendingSales))
	// Canal para recibir resultados
	results := make(chan WorkerResult, len(pendingSales))

	// Inicializar workers
	var wg sync.WaitGroup
	for i := 0; i < config.NumWorkers; i++ {
		wg.Add(1)
		go rg.saleWorker(ctx, &wg, jobs, results, pendingSales, saleService, clientService)
	}

	// Enviar trabajos
	go func() {
		defer close(jobs)
		for i := range pendingSales {
			select {
			case jobs <- i:
			case <-ctx.Done():
				return
			}
		}
	}()

	// Cerrar canal de resultados cuando todos los workers terminen
	go func() {
		wg.Wait()
		close(results)
	}()

	// Recolectar resultados
	salesData := make([]SaleEntry, len(pendingSales))
	var processingErrors []error

	for result := range results {
		if result.Error != nil {
			processingErrors = append(processingErrors, result.Error)
			continue
		}
		salesData[result.Index] = result.SaleData
	}

	// Verificar si hay demasiados errores basándose en la configuración
	errorRate := float64(len(processingErrors)) / float64(len(pendingSales))
	if errorRate > config.ErrorLimit {
		return nil, fmt.Errorf("demasiados errores de procesamiento: %.1f%% (límite: %.1f%%), %d de %d",
			errorRate*100, config.ErrorLimit*100, len(processingErrors), len(pendingSales))
	}

	// Filtrar entradas vacías (errores)
	validSales := make([]SaleEntry, 0, len(salesData))
	for _, sale := range salesData {
		if sale.ClientName != "" { // Verificar que la venta fue procesada
			validSales = append(validSales, sale)
		}
	}

	// Crear datos para el template del libro
	now := time.Now()
	bookData := SalesBookData{
		BaseData: BaseData{
			GeneratedAt: now,
			ReportType:  "sales_book",
		},
		GeneratedDate: formatDate(&now),
		Sales:         validSales,
	}

	// Generar HTML usando el template del libro de ventas
	htmlContent, err := rg.templateManager.GenerateSalesBookHTML(bookData)
	if err != nil {
		return nil, fmt.Errorf("error generando HTML: %w", err)
	}

	// Convertir HTML a PDF
	pdfContent, err := rg.converter.ConvertHTMLToPDF(htmlContent)
	if err != nil {
		return nil, fmt.Errorf("error convirtiendo a PDF: %w", err)
	}

	return pdfContent, nil
}

// saleWorker procesa ventas de forma concurrente
func (rg *ReportGenerator) saleWorker(
	ctx context.Context,
	wg *sync.WaitGroup,
	jobs <-chan int,
	results chan<- WorkerResult,
	pendingSales []*ports.PendingSale,
	saleService ports.SaleService,
	clientService ports.ClientService,
) {
	defer wg.Done()

	for {
		select {
		case index, ok := <-jobs:
			if !ok {
				return
			}

			result := rg.processSale(index, pendingSales[index], saleService, clientService)

			select {
			case results <- result:
			case <-ctx.Done():
				return
			}

		case <-ctx.Done():
			return
		}
	}
}

// processSale procesa una venta individual
func (rg *ReportGenerator) processSale(
	index int,
	pendingSale *ports.PendingSale,
	saleService ports.SaleService,
	clientService ports.ClientService,
) WorkerResult {
	// Obtener detalles completos de la venta
	sale, err := saleService.GetByID(fmt.Sprintf("%d", pendingSale.ID))
	if err != nil {
		return WorkerResult{Index: index, Error: fmt.Errorf("error obteniendo venta %d: %w", pendingSale.ID, err)}
	}

	// Obtener datos del cliente
	clientIDStr := fmt.Sprintf("%d", pendingSale.ClientID)
	client, err := clientService.Get(clientIDStr)
	if err != nil {
		return WorkerResult{Index: index, Error: fmt.Errorf("error obteniendo cliente %s: %w", clientIDStr, err)}
	}

	// Preparar datos para la ficha de venta
	quotaPrice := sale.Quotas[0].Amount
	saleEntry := SaleEntry{
		ClientName:          client.Name,
		ClientLastname:      client.Lastname,
		ClientInitials:      getInitials(client.Lastname),
		ClientDni:           dashIfEmpty(client.Dni),
		ClientEmail:         dashIfEmpty(client.Email),
		ClientPhone:         dashIfEmpty(client.Phone),
		SaleDate:            formatDate(sale.Date),
		ProductDesc:         sale.Description,
		NumQuotas:           len(sale.Quotas),
		QuotaPrice:          quotaPrice,
		QuotaPriceFormatted: formatMoney(quotaPrice),
	}

	// Agregar cuotas
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
			DueDate:         formatDate(q.DueDate),
			Amount:          q.Amount,
			AmountFormatted: formatMoney(q.Amount),
		}
		saleEntry.Quotas = append(saleEntry.Quotas, row)
	}

	return WorkerResult{Index: index, SaleData: saleEntry, Error: nil}
}

// GenerateSalesBookPDF genera un libro de ventas de forma secuencial (método original)
func (rg *ReportGenerator) GenerateSalesBookPDF(saleService ports.SaleService, clientService ports.ClientService) ([]byte, error) {
	// Obtener todas las ventas pendientes ordenadas alfabéticamente
	pendingSales, err := saleService.GetPendingSalesOrderedByClient()
	if err != nil {
		return nil, fmt.Errorf("error obteniendo ventas pendientes: %w", err)
	}

	if len(pendingSales) == 0 {
		return nil, fmt.Errorf("no hay ventas pendientes para generar el libro")
	}

	var salesData []SaleEntry

	// Procesar cada venta para crear los datos de la ficha
	for _, pendingSale := range pendingSales {
		// Obtener detalles completos de la venta
		sale, err := saleService.GetByID(fmt.Sprintf("%d", pendingSale.ID))
		if err != nil {
			continue // Saltar ventas con errores
		}

		// Obtener datos del cliente
		clientIDStr := fmt.Sprintf("%d", pendingSale.ClientID)
		client, err := clientService.Get(clientIDStr)
		if err != nil {
			continue // Saltar si no se puede obtener el cliente
		}

		// Preparar datos para la ficha de venta
		quotaPrice := sale.Quotas[0].Amount
		saleEntry := SaleEntry{
			ClientName:          client.Name,
			ClientLastname:      client.Lastname,
			ClientInitials:      getInitials(client.Lastname),
			ClientDni:           dashIfEmpty(client.Dni),
			ClientEmail:         dashIfEmpty(client.Email),
			ClientPhone:         dashIfEmpty(client.Phone),
			SaleDate:            formatDate(sale.Date),
			ProductDesc:         sale.Description,
			NumQuotas:           len(sale.Quotas),
			QuotaPrice:          quotaPrice,
			QuotaPriceFormatted: formatMoney(quotaPrice),
		}

		// Agregar cuotas
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
				DueDate:         formatDate(q.DueDate),
				Amount:          q.Amount,
				AmountFormatted: formatMoney(q.Amount),
			}
			saleEntry.Quotas = append(saleEntry.Quotas, row)
		}

		salesData = append(salesData, saleEntry)
	}

	// Crear datos para el template del libro
	now := time.Now()
	bookData := SalesBookData{
		BaseData: BaseData{
			GeneratedAt: now,
			ReportType:  "sales_book",
		},
		GeneratedDate: formatDate(&now),
		Sales:         salesData,
	}

	// Generar HTML usando el template del libro de ventas
	htmlContent, err := rg.templateManager.GenerateSalesBookHTML(bookData)
	if err != nil {
		return nil, fmt.Errorf("error generando HTML: %w", err)
	}

	// Convertir HTML a PDF
	pdfContent, err := rg.converter.ConvertHTMLToPDF(htmlContent)
	if err != nil {
		return nil, fmt.Errorf("error convirtiendo a PDF: %w", err)
	}

	return pdfContent, nil
}
