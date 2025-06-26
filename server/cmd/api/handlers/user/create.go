package user

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	var createRequest dto.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&createRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if createRequest.Username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}
	if createRequest.Password == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}

	user, err := h.Service.CreateUser(r.Context(), &createRequest)
	if err != nil {
		responses.Err(w, err)
		return
	}

	// Convert domain user to DTO
	userResponse := &dto.UserResponse{
		ID:          user.ID,
		Username:    user.Username,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Permissions: user.Permissions,
		IsActive:    user.IsActive,
	}

	responses.Created(w, userResponse)
}
