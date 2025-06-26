package user

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	err = h.Service.DeleteUser(r.Context(), userID)
	if err != nil {
		responses.Err(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User deleted successfully",
	})
}
