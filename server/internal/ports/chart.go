package ports

import (
	"github.com/benitez96/gostore/internal/domain"
)

type ChartService interface {
	GetQuotaMonthlySummary() ([]*domain.QuotaMonthlySummary, error)
	GetClientStatusCount() ([]*domain.ClientStatusCount, error)
	GetDashboardStats() (*domain.DashboardStats, error)
}

type ChartRepository interface {
	GetQuotaMonthlySummary() ([]*domain.QuotaMonthlySummary, error)
	GetClientStatusCount() ([]*domain.ClientStatusCount, error)
	GetDashboardStats() (*domain.DashboardStats, error)
}
