package client

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/benitez96/gostore/cmd/core/responses"

	"github.com/julienschmidt/httprouter"
)


func (h *Handler) GetAllClients(
	w http.ResponseWriter, 
	r *http.Request, 
	_ httprouter.Params,
) {

	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil { limit = 10 }

	offset, err := strconv.Atoi(r.URL.Query().Get("offset"))
	if err != nil { offset = 0 }

	search := r.URL.Query().Get("search")

	clients, err := h.Service.GetAll(search, limit, offset)

	if err != nil { 
		responses.Err(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&clients)
}

func (h *Handler) GetClientByID(
	w http.ResponseWriter, 
	r *http.Request, 
	ps httprouter.Params,
){

	client, err := h.Service.Get(ps.ByName("id"))

	if err != nil { 
		responses.Err(w, err)
		return
	}

	responses.Ok(w, client)
}
