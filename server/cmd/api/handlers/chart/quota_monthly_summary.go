package chart

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GetQuotaMonthlySummary(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Obtener el año de la query string, por defecto el año actual
	yearStr := r.URL.Query().Get("year")
	var year time.Time

	if yearStr == "" {
		year = time.Now()
	} else {
		yearInt, err := strconv.Atoi(yearStr)
		if err != nil {
			http.Error(w, "Invalid year parameter", http.StatusBadRequest)
			return
		}
		year = time.Date(yearInt, 1, 1, 0, 0, 0, 0, time.UTC)
	}

	summaries, err := h.Service.GetQuotaMonthlySummary(year)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summaries)
}

func (h *Handler) GetAvailableYears(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	years, err := h.Service.GetAvailableYears()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(years)
}
