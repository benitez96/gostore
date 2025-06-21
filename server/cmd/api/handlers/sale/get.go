package sale

import (
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GetByID(
	w http.ResponseWriter,
	r *http.Request,
	ps httprouter.Params,
) {
	sale, err := h.Service.GetByID(ps.ByName("id"))

	if err != nil {
		responses.Err(w, err)
		return
	}

	// Convert domain to DTO for clean API response
	saleResponse := dto.ToSaleResponse(sale)
	responses.Ok(w, saleResponse)
}
