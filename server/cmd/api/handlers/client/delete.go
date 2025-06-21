package client

import (
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) DeleteClient(
	w http.ResponseWriter,
	r *http.Request,
	params httprouter.Params,
) {
	clientID := params.ByName("id")
	if clientID == "" {
		http.Error(w, "Client ID is required", http.StatusBadRequest)
		return
	}

	if err := h.Service.Delete(clientID); err != nil {
		responses.Err(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
