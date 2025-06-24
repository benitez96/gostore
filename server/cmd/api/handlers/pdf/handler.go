package pdf

import (
	"github.com/benitez96/gostore/internal/services/pdf"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	Service *pdf.Service
}

func (h *Handler) RegisterRoutes(router *httprouter.Router) {
	router.GET("/api/pdf/venta/:id", h.GenerateSaleSheet)
}
