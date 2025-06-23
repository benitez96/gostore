package pdf

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/domain"
	"github.com/julienschmidt/httprouter"
)

type GenerateReceiptRequest struct {
	PaymentID interface{} `json:"payment_id"` // Acepta tanto string como número
}

func (h *Handler) GeneratePaymentReceipt(
	w http.ResponseWriter,
	r *http.Request,
	params httprouter.Params,
) {
	var req GenerateReceiptRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Convertir PaymentID a string
	var paymentIDStr string
	switch v := req.PaymentID.(type) {
	case string:
		paymentIDStr = v
	case float64:
		paymentIDStr = fmt.Sprintf("%.0f", v)
	case int:
		paymentIDStr = fmt.Sprintf("%d", v)
	default:
		http.Error(w, "Payment ID must be a string or number", http.StatusBadRequest)
		return
	}

	if paymentIDStr == "" {
		http.Error(w, "Payment ID is required", http.StatusBadRequest)
		return
	}

	// TODO: Obtener los datos del payment, client, quota y sale desde la base de datos
	// Por ahora, creamos datos de prueba para hacer funcionar el endpoint

	// Datos de prueba
	payment := &domain.Payment{
		ID:      1,
		Amount:  50000.0,
		Date:    nil, // Se establecerá en el servicio
		QuotaID: 1,
	}

	client := &domain.Client{
		ID:       1,
		Name:     "Juan",
		Lastname: "Pérez",
		Dni:      "12345678",
	}

	quota := &domain.Quota{
		ID:     1,
		Number: 1,
		Amount: 50000.0,
	}

	sale := &domain.Sale{
		ID:          1,
		Description: "Venta de prueba",
		Amount:      50000.0,
	}

	// Generar el PDF
	pdfContent, err := h.Service.GeneratePaymentReceipt(payment, client, quota, sale)
	if err != nil {
		responses.Err(w, err)
		return
	}

	// Configurar headers para descarga del PDF
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=comprobante_pago.pdf")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(pdfContent)))

	// Escribir el contenido del PDF
	w.Write(pdfContent)
}
