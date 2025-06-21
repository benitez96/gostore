package domain

import "time"

type Product struct {
	ID        any       `json:"id"`
	Name      string    `json:"name"`
	Cost      float64   `json:"cost"`
	Price     float64   `json:"price"`
	Stock     int       `json:"stock"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
