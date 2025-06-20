package sale

import (
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/julienschmidt/httprouter"
)


func (h *Handler) GetByID(
	w http.ResponseWriter, 
	r *http.Request, 
	ps httprouter.Params,
){

	sales, err := h.Service.GetByID(ps.ByName("id"))

	if err != nil { 
		responses.Err(w, err)
		return
	}

	responses.Ok(w, sales)
}
