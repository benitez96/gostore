package domain

import "time"


type SaleProduct struct {
	ID					any  			`json:"id"`
	Name				string  	`json:"name"`
	Cost				float64 	`json:"cost"`
	Price				float64 	`json:"price"`
	Quantity		int64   	`json:"quantity"`

	UpdatedAt *time.Time
}


type SaleProductDescription struct {
	Name				string
	Quantity		int
}
