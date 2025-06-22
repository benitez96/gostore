package chart

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GetClientStatusCount(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	statusCounts, err := h.Service.GetClientStatusCount()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(statusCounts)
}
