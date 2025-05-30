package client

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/domain"
	"github.com/julienschmidt/httprouter"
)



func (h *Handler) CreateClient(
	w http.ResponseWriter, 
	r *http.Request, 
	_ httprouter.Params,
) {

	var clientData domain.Client
	if err := json.NewDecoder(r.Body).Decode(&clientData); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if err := h.Service.Create(&clientData); err != nil {
		responses.Err(w, err)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
