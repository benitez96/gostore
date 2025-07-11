package repositories

import (
	"time"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) GetDailyCollections(startDate, endDate time.Time) ([]*domain.DailyCollection, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	params := sqlc.GetDailyCollectionsParams{
		Date:   startDate,
		Date_2: endDate,
	}

	collections, err := r.Queries.GetDailyCollections(ctx, params)
	if err != nil {
		return nil, err
	}

	var domainCollections []*domain.DailyCollection
	for _, collection := range collections {
		// Type assertion for CollectionDate (interface{} to string)
		collectionDate := ""
		if collection.CollectionDate != nil {
			collectionDate = collection.CollectionDate.(string)
		}

		// Convert sql.NullFloat64 to float64
		totalCollected := 0.0
		if collection.TotalCollected.Valid {
			totalCollected = collection.TotalCollected.Float64
		}

		domainCollections = append(domainCollections, &domain.DailyCollection{
			CollectionDate: collectionDate,
			TotalCollected: totalCollected,
			PaymentCount:   collection.PaymentCount,
		})
	}

	return domainCollections, nil
}
