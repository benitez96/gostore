package ports

import (
	"time"

	"github.com/benitez96/gostore/internal/domain"
)

type ChartService interface {
	GetQuotaMonthlySummary(year time.Time) ([]*domain.QuotaMonthlySummary, error)
	GetQuotaMonthlySummaryAll() ([]*domain.QuotaMonthlySummary, error)
	GetAvailableYears() ([]string, error)
	GetClientStatusCount() ([]*domain.ClientStatusCount, error)
	GetDashboardStats() (*domain.DashboardStats, error)
	GetDailyCollections(startDate, endDate time.Time) ([]*domain.DailyCollection, error)
}

type ChartRepository interface {
	GetQuotaMonthlySummary(year time.Time) ([]*domain.QuotaMonthlySummary, error)
	GetQuotaMonthlySummaryAll() ([]*domain.QuotaMonthlySummary, error)
	GetAvailableYears() ([]string, error)
	GetClientStatusCount() ([]*domain.ClientStatusCount, error)
	GetDashboardStats() (*domain.DashboardStats, error)
	GetDailyCollections(startDate, endDate time.Time) ([]*domain.DailyCollection, error)
}
