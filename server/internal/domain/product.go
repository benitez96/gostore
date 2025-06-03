package domain

import "time"


type Product struct {
	ID				any  			`json:"id"`
	Name			string  	`json:"name"`
	Cost			float64 	`json:"cost"`
	Price			float64 	`json:"price"`

	UpdatedAt *time.Time
}


