package domain

import "time"

type SaleSummary struct {
	ID          any    `json:"id"`
	Description string `json:"description"`
	IsPaid      bool   `json:"is_paid"`
	StateID     int    `json:"state"`
}

type Sale struct {
	ID          any            `json:"id"`
	Description string         `json:"description"`
	Amount      float64        `json:"amount"`
	IsPaid      bool           `json:"is_paid"`
	Date        *time.Time     `json:"date"`
	StateID     int            `json:"state"`
	ClientID    any            `json:"client_id"`
	Products    []*SaleProduct `json:"products"`
	Quotas      []*Quota       `json:"quotas"`
	Notes       []*Note        `json:"notes"`
}
