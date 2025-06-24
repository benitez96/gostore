package pdf

import (
	"net/http"
	"strconv"

	"github.com/julienschmidt/httprouter"
)

func (h *Handler) GenerateSaleSheet(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	idStr := ps.ByName("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("ID de venta inválido"))
		return
	}

	pdfBytes, err := h.Service.GenerateSaleSheetPDF(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error generando PDF: " + err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=venta_"+idStr+".pdf")
	w.WriteHeader(http.StatusOK)
	w.Write(pdfBytes)
}
