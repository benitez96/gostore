package utils

import (
	"time"

	"github.com/benitez96/gostore/internal/domain"
)

// DetermineClientState calculates the appropriate client state based on all their sales
func DetermineClientState(sales []*domain.SaleSummary) int {
	if len(sales) == 0 {
		return domain.StateOK // Default to OK if no sales
	}

	// Check for the worst state among all sales
	hasState3 := false
	hasState2 := false

	for _, sale := range sales {
		switch sale.StateID {
		case domain.StateSuspended:
			hasState3 = true
		case domain.StateWarning:
			hasState2 = true
		}
	}

	// Priority: State 3 > State 2 > State 1
	if hasState3 {
		return domain.StateSuspended
	}
	if hasState2 {
		return domain.StateWarning
	}
	return domain.StateOK
}

// DetermineQuotaState calculates the appropriate quota state based on due date
func DetermineQuotaState(dueDate *time.Time) int {
	if dueDate == nil {
		return domain.StateOK // Default to OK if no due date
	}

	now := time.Now()
	monthsPast := int(now.Sub(*dueDate).Hours() / 24 / 30)

	if monthsPast >= 2 {
		return domain.StateSuspended // Suspended - past 2 months
	}
	if monthsPast >= 1 {
		return domain.StateWarning // Warning - past 1 month
	}
	return domain.StateOK // OK - not past due
}
