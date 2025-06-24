package product

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/internal/ports"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	Service ports.ProductService
}

func (h *Handler) GetProductStats(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	stats, err := h.Service.GetStats()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
