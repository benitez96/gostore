package user

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	var refreshRequest dto.RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&refreshRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if refreshRequest.RefreshToken == "" {
		http.Error(w, "Refresh token is required", http.StatusBadRequest)
		return
	}

	response, err := h.Service.RefreshToken(r.Context(), &refreshRequest)
	if err != nil {
		responses.Err(w, err)
		return
	}

	responses.Ok(w, response)
}
