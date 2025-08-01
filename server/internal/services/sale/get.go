package sale

import (
	"fmt"
	"strconv"
	"sync"

	"github.com/benitez96/gostore/internal/domain"
)

// safeToString safely converts an interface{} value to string
func safeToString(value any) string {
	if value == nil {
		return ""
	}

	switch v := value.(type) {
	case string:
		return v
	case int64:
		return strconv.FormatInt(v, 10)
	case int:
		return strconv.Itoa(v)
	case float64:
		return strconv.FormatFloat(v, 'f', 0, 64)
	default:
		return fmt.Sprintf("%v", v)
	}
}

func (s Service) GetByClientID(id string) (sale []*domain.SaleSummary, err error) {
	return s.Sr.GetByClientID(id)
}

func (s Service) GetByID(id string) (*domain.Sale, error) {
	var (
		wg       sync.WaitGroup
		sale     *domain.Sale
		products []*domain.SaleProduct
		quotas   []*domain.Quota
		errOnce  sync.Once
		retErr   error
	)

	wg.Add(3)

	go func() {
		defer wg.Done()
		result, err := s.Sr.GetByID(id)
		if err != nil {
			errOnce.Do(func() { retErr = err })
			return
		}
		sale = result
	}()

	go func() {
		defer wg.Done()
		result, err := s.Spr.GetBySaleID(id)
		if err != nil {
			errOnce.Do(func() { retErr = err })
			return
		}
		products = result
	}()

	go func() {
		defer wg.Done()
		result, err := s.Qr.GetBySaleID(id)
		if err != nil {
			errOnce.Do(func() { retErr = err })
			return
		}
		quotas = result
	}()

	wg.Wait()

	if retErr != nil {
		return nil, retErr
	}

	// Fan-out para buscar los payments por cada cuota
	var pwg sync.WaitGroup
	for _, quota := range quotas {
		q := quota
		pwg.Add(1)

		go func() {
			defer pwg.Done()
			paymentDB, err := s.Pr.GetByQuotaID(safeToString(q.ID))
			if err != nil {
				// si hay error, simplemente lo ignoramos o logueamos; podés personalizar esto
				return
			}
			q.Payments = make([]*domain.Payment, 0, len(paymentDB))
			for _, p := range paymentDB {
				q.Payments = append(q.Payments, &domain.Payment{
					ID:     p.ID,
					Amount: p.Amount,
					Date:   p.Date,
				})
			}
		}()
	}
	pwg.Wait()

	// Armar resultado final
	sale.Products = products
	sale.Quotas = quotas

	return sale, nil
}
