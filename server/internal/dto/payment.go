package dto

import "time"

type CreatePaymentRequest struct {
	Amount  float64    `json:"amount"`
	Date    *time.Time `json:"date,omitempty"`
	QuotaID string     `json:"quota_id"`
} 