package chart

import (
	"time"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/ports"
)

// Make sure Service implements the ChartService interface
// at compile time.
var _ ports.ChartService = &Service{}

type Service struct {
	Repo ports.ChartRepository
}

func (s *Service) GetQuotaMonthlySummary(year time.Time) ([]*domain.QuotaMonthlySummary, error) {
	return s.Repo.GetQuotaMonthlySummary(year)
}

func (s *Service) GetQuotaMonthlySummaryAll() ([]*domain.QuotaMonthlySummary, error) {
	return s.Repo.GetQuotaMonthlySummaryAll()
}

func (s *Service) GetAvailableYears() ([]string, error) {
	return s.Repo.GetAvailableYears()
}

func (s *Service) GetDashboardStats() (*domain.DashboardStats, error) {
	return s.Repo.GetDashboardStats()
}
