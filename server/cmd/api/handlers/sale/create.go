package sale

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)


func (h *Handler) CreateSale(
	w http.ResponseWriter, 
	r *http.Request, 
	_ httprouter.Params,
) {

	var dto dto.CreateSaleDto
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	id, err := h.Service.Create(&dto); 
	if err != nil {
		responses.Err(w, err)
		return
	}

	responses.Created(w, id)
}
