package product

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) DeleteProduct(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	productID := ps.ByName("id")

	err := h.Service.Delete(productID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
