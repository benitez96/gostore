package payment

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/domain"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) CreatePayment(
	w http.ResponseWriter,
	r *http.Request,
	_ httprouter.Params,
) {
	var payment *domain.Payment
	if err := json.NewDecoder(r.Body).Decode(&payment); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Convert DTO to domain model
	if err := h.Service.Create(payment); err != nil {
		responses.Err(w, err)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
