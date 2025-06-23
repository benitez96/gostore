package pdf

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
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

	// Debug: imprimir el tipo y valor del PaymentID
	log.Printf("PaymentID type: %T, value: %v", req.PaymentID, req.PaymentID)

	// Convertir PaymentID a string
	var paymentIDStr string
	switch v := req.PaymentID.(type) {
	case string:
		paymentIDStr = v
	case float64:
		paymentIDStr = fmt.Sprintf("%.0f", v)
	case int:
		paymentIDStr = fmt.Sprintf("%d", v)
	case int64:
		paymentIDStr = fmt.Sprintf("%d", v)
	default:
		log.Printf("Unsupported PaymentID type: %T", req.PaymentID)
		http.Error(w, "Payment ID must be a string or number", http.StatusBadRequest)
		return
	}

	log.Printf("Converted PaymentID to string: %s", paymentIDStr)

	if paymentIDStr == "" {
		http.Error(w, "Payment ID is required", http.StatusBadRequest)
		return
	}

	// Generar el PDF usando el service
	pdfContent, err := h.Service.GeneratePaymentReceiptFromID(paymentIDStr)
	if err != nil {
		log.Printf("Error generating PDF: %v", err)
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
