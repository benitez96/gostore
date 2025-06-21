package product

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) UpdateProduct(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	productID := ps.ByName("id")

	var updateProductRequest dto.UpdateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&updateProductRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	product, err := h.Service.Update(
		productID,
		updateProductRequest.Name,
		updateProductRequest.Cost,
		updateProductRequest.Price,
		updateProductRequest.Stock,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}
