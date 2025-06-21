package domain

type State struct {
	ID          any    `json:"id"`
	Description string `json:"description"`
}

const (
	StateOK        = 1 // OK - Everything is fine
	StateWarning   = 2 // Warning - Past due but not critical
	StateSuspended = 3 // Suspended - Critical overdue
)
