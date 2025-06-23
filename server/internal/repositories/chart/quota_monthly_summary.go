package repositories

import (
	"sync"
	"time"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

// safeToFloat64 safely converts an interface{} value to float64
func safeToFloat64(value any) float64 {
	if value == nil {
		return 0.0
	}

	switch v := value.(type) {
	case float64:
		return v
	case int64:
		return float64(v)
	case int:
		return float64(v)
	case float32:
		return float64(v)
	default:
		return 0.0
	}
}

func (r *Repository) GetQuotaMonthlySummary(year time.Time) ([]*domain.QuotaMonthlySummary, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	summaries, err := r.Queries.GetQuotaMonthlySummary(ctx, year)
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

func (r *Repository) GetQuotaMonthlySummaryAll() ([]*domain.QuotaMonthlySummary, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	summaries, err := r.Queries.GetQuotaMonthlySummaryAll(ctx)
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

func (r *Repository) GetAvailableYears() ([]string, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	years, err := r.Queries.GetAvailableYears(ctx)
	if err != nil {
		return nil, err
	}

	var yearStrings []string
	for _, year := range years {
		// Type assertion for year (interface{} to string)
		yearStr, ok := year.(string)
		if !ok {
			continue // Skip if year is not a string
		}
		yearStrings = append(yearStrings, yearStr)
	}

	return yearStrings, nil
}

func (r *Repository) GetDashboardStats() (*domain.DashboardStats, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	var wg sync.WaitGroup
	stats := &domain.DashboardStats{}
	errChan := make(chan error, 14)

	wg.Add(14)

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
		stats.TotalRevenue = safeToFloat64(total)
	}()

	go func() {
		defer wg.Done()
		pending, err := r.Queries.GetPendingAmount(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.PendingAmount = safeToFloat64(pending)
	}()

	go func() {
		defer wg.Done()
		collected, err := r.Queries.GetCollectedThisMonth(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.CollectedThisMonth = safeToFloat64(collected)
	}()

	go func() {
		defer wg.Done()
		quotasDue, err := r.Queries.GetQuotasDueThisMonth(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.QuotasDueThisMonth = safeToFloat64(quotasDue)
	}()

	go func() {
		defer wg.Done()
		collectedFromQuotas, err := r.Queries.GetCollectedFromQuotasDueThisMonth(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.CollectedFromQuotasDueThisMonth = safeToFloat64(collectedFromQuotas)
	}()

	go func() {
		defer wg.Done()
		quotasDueNext, err := r.Queries.GetQuotasDueNextMonth(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.QuotasDueNextMonth = safeToFloat64(quotasDueNext)
	}()

	go func() {
		defer wg.Done()
		paidQuotas, err := r.Queries.GetPaidQuotasDueThisMonth(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.PaidQuotasDueThisMonth = paidQuotas
	}()

	go func() {
		defer wg.Done()
		countQuotas, err := r.Queries.GetCountQuotasDueThisMonth(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.CountQuotasDueThisMonth = countQuotas
	}()

	go func() {
		defer wg.Done()
		paidQuotasLast, err := r.Queries.GetPaidQuotasDueLastMonth(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.PaidQuotasDueLastMonth = paidQuotasLast
	}()

	go func() {
		defer wg.Done()
		countQuotasLast, err := r.Queries.GetCountQuotasDueLastMonth(ctx)
		if err != nil {
			errChan <- err
			return
		}
		stats.CountQuotasDueLastMonth = countQuotasLast
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
