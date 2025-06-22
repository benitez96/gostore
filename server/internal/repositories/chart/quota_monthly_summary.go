package repositories

import (
	"sync"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) GetQuotaMonthlySummary() ([]*domain.QuotaMonthlySummary, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	summaries, err := r.Queries.GetQuotaMonthlySummary(ctx)
	if err != nil {
		return nil, err
	}

	var domainSummaries []*domain.QuotaMonthlySummary
	for _, summary := range summaries {
		// Type assertion for month (interface{} to string)
		month, ok := summary.Month.(string)
		if !ok {
			continue // Skip if month is not a string
		}

		domainSummaries = append(domainSummaries, &domain.QuotaMonthlySummary{
			Month:         month,
			TotalAmount:   summary.TotalAmount.Float64,
			AmountPaid:    summary.AmountPaid.Float64,
			AmountNotPaid: summary.AmountNotPaid.Float64,
		})
	}

	return domainSummaries, nil
}

func (r *Repository) GetDashboardStats() (*domain.DashboardStats, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	var wg sync.WaitGroup
	stats := &domain.DashboardStats{}
	errChan := make(chan error, 5)

	wg.Add(5)

	go func() {
		defer wg.Done()
		total, err := r.Queries.GetTotalClients(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.TotalClients = total
	}()

	go func() {
		defer wg.Done()
		total, err := r.Queries.GetTotalProducts(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.TotalProducts = total
	}()

	go func() {
		defer wg.Done()
		total, err := r.Queries.GetTotalSales(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.TotalSales = total
	}()

	go func() {
		defer wg.Done()
		total, err := r.Queries.GetActiveSales(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.ActiveSales = total
	}()

	go func() {
		defer wg.Done()
		total, err := r.Queries.GetTotalRevenue(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.TotalRevenue = total.(float64)
	}()

	wg.Wait()
	close(errChan)

	for err := range errChan {
		if err != nil {
			return nil, err // Return the first error encountered
		}
	}

	return stats, nil
}
