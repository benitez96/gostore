package client

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/internal/dto"
	"github.com/benitez96/gostore/internal/ports"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	Service ports.ClientService
}

func (h *Handler) UpdateClient(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	clientID := ps.ByName("id")
	if clientID == "" {
		http.Error(w, "Client ID is required", http.StatusBadRequest)
		return
	}

	var updateRequest dto.UpdateClientRequest
	if err := json.NewDecoder(r.Body).Decode(&updateRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if updateRequest.Name == "" || updateRequest.Lastname == "" || updateRequest.Dni == "" {
		http.Error(w, "Name, lastname, and DNI are required", http.StatusBadRequest)
		return
	}

	err := h.Service.Update(clientID, &updateRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Client updated successfully",
	})
}
