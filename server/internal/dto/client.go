package dto

type CreateClientRequest struct {
	Name        string 	`json:"name"`
	Lastname	  string 	`json:"lastname"`
	Dni					string	`json:"dni"`
	Email       string 	`json:"email"`
	Phone       string 	`json:"phone"`
	Address     string 	`json:"address"`
}
