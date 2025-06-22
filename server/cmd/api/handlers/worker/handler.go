package worker

import (
	"net/http"

	"github.com/benitez96/gostore/internal/services/worker"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	Service *worker.Service
}

// RunStateUpdate ejecuta manualmente la actualización de estados
func (h *Handler) RunStateUpdate(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Ejecutar la actualización de estados
	h.Service.UpdateStates()

	// Responder con éxito
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "State update completed successfully"}`))
}
