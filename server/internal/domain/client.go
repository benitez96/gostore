package domain

import "time"


type ClientSummary struct {
	ID          any 		`json:"id"`
	Name        string 	`json:"name"`
	Lastname	  string 	`json:"lastname"`
	Dni					string	`json:"dni"`
	State			  *State 	`json:"state"`
}

type Client struct {
	ID          any 		`json:"id"`
	Name        string 	`json:"name"`
	Lastname	  string 	`json:"lastname"`
	Dni					string	`json:"dni"`
	State			  *State 	`json:"state"`
	Email       string 	`json:"email"`
	Phone       string 	`json:"phone"`
	Address     string 	`json:"address"`
	Sales				[]*Sale `json:"sales"`
	CreatedAt 	*time.Time
	UpdatedAt 	*time.Time
}
