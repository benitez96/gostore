package user

import (
	"net/http"
	"strconv"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GetUsers(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Por defecto traemos TODOS los usuarios (activos e inactivos)
	// Solo filtramos si se especifica explícitamente el parámetro active
	activeParam := r.URL.Query().Get("active")

	var users []*domain.UserSummary
	var err error

	if activeParam == "true" {
		users, err = h.Service.GetUsers(r.Context(), true)
	} else if activeParam == "false" {
		users, err = h.Service.GetUsers(r.Context(), false)
	} else {
		// Sin parámetro = traer todos los usuarios con una sola query optimizada
		users, err = h.Service.GetAllUsers(r.Context())
	}
	if err != nil {
		responses.Err(w, err)
		return
	}

	// Convert domain users to DTO
	userResponses := make([]*dto.UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = &dto.UserResponse{
			ID:          user.ID,
			Username:    user.Username,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			Permissions: user.Permissions,
			IsActive:    user.IsActive,
		}
	}

	responses.Ok(w, userResponses)
}

func (h *Handler) GetUserByID(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	userIDStr := ps.ByName("id")
	if userIDStr == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := h.Service.GetUserByID(r.Context(), userID)
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

	responses.Ok(w, userResponse)
}
