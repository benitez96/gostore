package dto

import "time"

type UpdateQuotaRequest struct {
	Amount  float64   `json:"amount"`
	DueDate time.Time `json:"due_date"`
}
