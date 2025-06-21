package payment

import (
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) DeletePayment(
	w http.ResponseWriter,
	r *http.Request,
	params httprouter.Params,
) {
	paymentID := params.ByName("id")
	if paymentID == "" {
		http.Error(w, "Payment ID is required", http.StatusBadRequest)
		return
	}

	if err := h.Service.Delete(paymentID); err != nil {
		responses.Err(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
