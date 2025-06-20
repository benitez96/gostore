package domain

import "time"

type Payment struct {
	ID      int64      `json:"id"`
	Amount  float64    `json:"amount"`
	Date    *time.Time `json:"date"`
	QuotaID int64      `json:"quota_id,omitempty"`
}
