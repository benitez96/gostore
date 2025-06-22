package chart

import (
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GetDashboardStats(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	stats, err := h.Service.GetDashboardStats()
	if err != nil {
		responses.Err(w, err)
		return
	}
	responses.Ok(w, stats)
}
