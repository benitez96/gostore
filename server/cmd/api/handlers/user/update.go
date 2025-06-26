package user

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	var updateRequest dto.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&updateRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if updateRequest.FirstName == "" {
		http.Error(w, "FirstName is required", http.StatusBadRequest)
		return
	}
	if updateRequest.LastName == "" {
		http.Error(w, "LastName is required", http.StatusBadRequest)
		return
	}

	err = h.Service.UpdateUser(r.Context(), userID, &updateRequest)
	if err != nil {
		responses.Err(w, err)
		return
	}

	// Get updated user and return DTO
	updatedUser, err := h.Service.GetUserByID(r.Context(), userID)
	if err != nil {
		responses.Err(w, err)
		return
	}

	userResponse := &dto.UserResponse{
		ID:          updatedUser.ID,
		Username:    updatedUser.Username,
		FirstName:   updatedUser.FirstName,
		LastName:    updatedUser.LastName,
		Permissions: updatedUser.Permissions,
		IsActive:    updatedUser.IsActive,
	}

	responses.Ok(w, userResponse)
}

func (h *Handler) UpdateUserPassword(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	var passwordRequest dto.UpdateUserPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&passwordRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if passwordRequest.Password == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}

	err = h.Service.UpdateUserPassword(r.Context(), userID, &passwordRequest)
	if err != nil {
		responses.Err(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Password updated successfully",
	})
}
