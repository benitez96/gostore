package user

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) Login(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	var loginRequest dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if loginRequest.Username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}
	if loginRequest.Password == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}

	response, err := h.Service.Login(r.Context(), &loginRequest)
	if err != nil {
		responses.Err(w, err)
		return
	}

	responses.Ok(w, response)
}
