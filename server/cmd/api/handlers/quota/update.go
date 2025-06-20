package quota

import (
	"encoding/json"
	"net/http"

	"github.com/benitez96/gostore/cmd/core/responses"
	"github.com/benitez96/gostore/internal/dto"
	"github.com/julienschmidt/httprouter"
)

func (h *Handler) UpdateQuota(
	w http.ResponseWriter,
	r *http.Request,
	params httprouter.Params,
) {
	quotaID := params.ByName("id")
	if quotaID == "" {
		http.Error(w, "Quota ID is required", http.StatusBadRequest)
		return
	}

	var updateRequest dto.UpdateQuotaRequest
	if err := json.NewDecoder(r.Body).Decode(&updateRequest); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if err := h.Service.Update(quotaID, updateRequest.Amount, updateRequest.DueDate); err != nil {
		responses.Err(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
