package domain

import "time"


type Sale struct {
	ID				any					`json:"id"`	
	Amount 		float64			`json:"amount"`
	IsPaid		bool				`json:"is_paid"`
	Products 	[]*Product	`json:"products"`
	Quotas 		[]*Quota		`json:"quotas"`
	CreatedAt *time.Time
	UpdatedAt *time.Time
}
