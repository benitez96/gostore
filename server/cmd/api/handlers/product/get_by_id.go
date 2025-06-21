package product

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GetProductByID(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	productID := ps.ByName("id")

	product, err := h.Service.GetByID(productID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}
