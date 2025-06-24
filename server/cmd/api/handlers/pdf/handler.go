package pdf

import (
	"fmt"
	"net/http"

	"github.com/benitez96/gostore/internal/services/pdf"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	Service *pdf.Service
}

func (h *Handler) RegisterRoutes(router *httprouter.Router) {
	router.GET("/api/pdf/venta/:id", h.GenerateSaleSheet)
	router.GET("/api/pdf/libro-ventas", h.GenerateSalesBook)
}

// GenerateSalesBook genera el libro de ventas pendientes en PDF usando la versión optimizada
func (h *Handler) GenerateSalesBook(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Usar la versión optimizada del servicio
	pdfContent, err := h.Service.GenerateSalesBookPDFOptimized()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error generando libro de ventas: %v", err), http.StatusInternalServerError)
		return
	}

	// Configurar headers para PDF
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=libro_ventas_pendientes.pdf")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(pdfContent)))

	// Escribir el PDF como respuesta
	_, err = w.Write(pdfContent)
	if err != nil {
		http.Error(w, "Error enviando archivo PDF", http.StatusInternalServerError)
		return
	}
}
