package product

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) CreateProduct(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	var createProductRequest dto.CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&createProductRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	product, err := h.Service.Create(
		createProductRequest.Name,
		createProductRequest.Cost,
		createProductRequest.Price,
		createProductRequest.Stock,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}
