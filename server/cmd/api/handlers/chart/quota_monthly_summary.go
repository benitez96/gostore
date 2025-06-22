package chart

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GetQuotaMonthlySummary(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	summaries, err := h.Service.GetQuotaMonthlySummary()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summaries)
}
