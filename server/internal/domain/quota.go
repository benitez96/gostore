package domain

import "time"

type Quota struct {
	ID        any 				`json:"id"`
	Number 		uint  	 		`json:"number"`
	Amount	 	float64  		`json:"amount"`
	IsPaid		bool    		`json:"is_paid"`
	StateID		int     		`json:"state"`
	DueDate 	*time.Time	`json:"due_date"`
}
