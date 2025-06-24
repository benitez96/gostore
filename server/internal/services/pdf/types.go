package pdf

import (
	"time"
)

// BaseData contiene datos comunes para todos los reportes
type BaseData struct {
	GeneratedAt time.Time `json:"generated_at"`
	ReportType  string    `json:"report_type"`
}

// PaymentReceiptData contiene los datos específicos para comprobantes de pago
type PaymentReceiptData struct {
	BaseData
	PaymentID       int64     `json:"payment_id"`
	Amount          float64   `json:"amount"`
	AmountFormatted string    `json:"amount_formatted"` // Monto formateado para mostrar
	Date            time.Time `json:"date"`
	ClientName      string    `json:"client_name"`
	ClientDni       string    `json:"client_dni"`
	QuotaNumber     int       `json:"quota_number"`
	SaleID          int64     `json:"sale_id"`
	SaleDescription string    `json:"sale_description"`
	ReceiptNumber   string    `json:"receipt_number"`
}

// SalesBookData contiene los datos para el libro de ventas masivo
type SalesBookData struct {
	BaseData
	GeneratedDate string      `json:"generated_date"`
	Sales         []SaleEntry `json:"sales"`
}

// SaleEntry representa una venta individual en el libro de ventas (reutiliza SaleSheetData)
type SaleEntry struct {
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

// ReportConfig contiene configuración para la generación de reportes
type ReportConfig struct {
	PageSize      string `json:"page_size"`
	MarginTop     string `json:"margin_top"`
	MarginRight   string `json:"margin_right"`
	MarginBottom  string `json:"margin_bottom"`
	MarginLeft    string `json:"margin_left"`
	DisableJS     bool   `json:"disable_js"`
	DisableImages bool   `json:"disable_images"`
}

// DefaultReportConfig retorna la configuración por defecto para reportes
func DefaultReportConfig() ReportConfig {
	return ReportConfig{
		PageSize:      "A4",
		MarginTop:     "10mm",
		MarginRight:   "10mm",
		MarginBottom:  "10mm",
		MarginLeft:    "10mm",
		DisableJS:     true,
		DisableImages: false,
	}
}
