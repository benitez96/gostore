package note

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/internal/dto"
	"github.com/benitez96/gostore/internal/ports"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	Service ports.NoteService
}

func (h *Handler) AddNote(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	saleID := ps.ByName("sale_id")
	if saleID == "" {
		http.Error(w, "Sale ID is required", http.StatusBadRequest)
		return
	}

	var addNoteRequest dto.AddNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&addNoteRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if addNoteRequest.Content == "" {
		http.Error(w, "Content is required", http.StatusBadRequest)
		return
	}

	note, err := h.Service.Create(addNoteRequest.Content, saleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}
