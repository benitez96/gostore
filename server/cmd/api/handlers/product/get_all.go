package product

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GetAllProducts(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	products, err := h.Service.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}
