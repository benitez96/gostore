package note

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) DeleteNote(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	noteID := ps.ByName("id")
	if noteID == "" {
		http.Error(w, "Note ID is required", http.StatusBadRequest)
		return
	}

	err := h.Service.Delete(noteID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
