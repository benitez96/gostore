package domain

import "time"


type Payment struct {
	ID 				any					`json:"id"`
	Amount 		float64 		`json:"amount"`
	Date 			*time.Time 	`json:"date"`
	CreatedAt	*time.Time 	`json:"created_at"`

	UpdatedAt	*time.Time
}
