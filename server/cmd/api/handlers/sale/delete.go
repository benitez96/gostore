package sale

import (
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) DeleteSale(
	w http.ResponseWriter,
	r *http.Request,
	params httprouter.Params,
) {
	saleID := params.ByName("id")
	if saleID == "" {
		http.Error(w, "Sale ID is required", http.StatusBadRequest)
		return
	}

	if err := h.Service.Delete(saleID); err != nil {
		responses.Err(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
