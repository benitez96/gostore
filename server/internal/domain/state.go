package domain

type State struct {
	ID				 	any 	 `json:"id"`
	Description string `json:"description"`
}

const (
	StateOk        	= 1
	StateWarn 			= 2
	StateSuspended  = 3
)
