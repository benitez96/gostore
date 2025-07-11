package chart

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GetDailyCollections(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Obtener las fechas de inicio y fin desde query parameters
	startDateStr := r.URL.Query().Get("start_date")
	endDateStr := r.URL.Query().Get("end_date")

	// Validar que ambos parámetros estén presentes
	if startDateStr == "" || endDateStr == "" {
		http.Error(w, "start_date and end_date parameters are required", http.StatusBadRequest)
		return
	}

	// Parsear las fechas (formato esperado: YYYY-MM-DD)
	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		http.Error(w, "Invalid start_date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		http.Error(w, "Invalid end_date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	// Validar que start_date sea anterior o igual a end_date
	if startDate.After(endDate) {
		http.Error(w, "start_date must be before or equal to end_date", http.StatusBadRequest)
		return
	}

	// Obtener los datos del servicio
	collections, err := h.Service.GetDailyCollections(startDate, endDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(collections)
}
