package responses

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/benitez96/gostore/internal/domain"
)

const InternalServerErrorMessage = "Ooops! Something went wrong. Please help us by reporting this issue."

// Error is a helper function to respond with an error. It checks if the error is an AppError and
// responds with the appropriate status code.
// If the error is not an AppError, it responds with a 500 status code and a generic error message.
func Err(w http.ResponseWriter, err error) {

	w.Header().Add("Content-Type", "application/json")
	var appErr domain.AppError
	if errors.As(err, &appErr) {
		if status, ok := ErrCodeMapping[appErr.Code]; ok {
			w.WriteHeader(status)
			json.NewEncoder(w).Encode(appErr)
			return
		}
	}

	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(domain.AppError{Code: domain.ErrCodeInternalServerError, Msg: InternalServerErrorMessage})
}

var ErrCodeMapping map[string]int = map[string]int{
	domain.ErrCodeDuplicateKey:  http.StatusConflict,
	domain.ErrCodeNotFound:      http.StatusNotFound,
	domain.ErrCodeInvalidParams: http.StatusBadRequest,
}

func Ok(w http.ResponseWriter, data any) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}
