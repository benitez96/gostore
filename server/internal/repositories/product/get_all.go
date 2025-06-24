package repositories

import (
	"database/sql"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) GetAll() ([]*domain.Product, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	products, err := r.Queries.GetAllProducts(ctx)
	if err != nil {
		return nil, err
	}

	var domainProducts []*domain.Product
	for _, product := range products {
		domainProducts = append(domainProducts, &domain.Product{
			ID:        product.ID,
			Name:      product.Name,
			Cost:      product.Cost.Float64,
			Price:     product.Price.Float64,
			Stock:     int(product.Stock),
			CreatedAt: product.CreatedAt,
			UpdatedAt: product.UpdatedAt,
		})
	}

	return domainProducts, nil
}

func (r *Repository) GetPaginated(limit, offset int, search string) (*domain.Paginated[*domain.Product], error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	// Get products with pagination and search
	products, err := r.Queries.GetProductsPaginated(ctx, sqlc.GetProductsPaginatedParams{
		Column1: search,
		Column2: sql.NullString{String: search, Valid: true},
		Limit:   int64(limit),
		Offset:  int64(offset),
	})
	if err != nil {
		return nil, err
	}

	// Get total count
	count, err := r.Queries.GetProductsCount(ctx, sqlc.GetProductsCountParams{
		Column1: search,
		Column2: sql.NullString{String: search, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	var domainProducts []*domain.Product
	for _, product := range products {
		domainProducts = append(domainProducts, &domain.Product{
			ID:        product.ID,
			Name:      product.Name,
			Cost:      product.Cost.Float64,
			Price:     product.Price.Float64,
			Stock:     int(product.Stock),
			CreatedAt: product.CreatedAt,
			UpdatedAt: product.UpdatedAt,
		})
	}

	return &domain.Paginated[*domain.Product]{
		Results: domainProducts,
		Count:   int(count),
	}, nil
}

func (r *Repository) GetStats() (*domain.ProductStats, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	stats, err := r.Queries.GetProductStats(ctx)
	if err != nil {
		return nil, err
	}

	// Convert interface{} to appropriate types
	totalValue := 0.0
	if stats.TotalValue != nil {
		if val, ok := stats.TotalValue.(float64); ok {
			totalValue = val
		}
	}

	totalCost := 0.0
	if stats.TotalCost != nil {
		if val, ok := stats.TotalCost.(float64); ok {
			totalCost = val
		}
	}

	totalStock := int64(0)
	if stats.TotalStock != nil {
		if val, ok := stats.TotalStock.(int64); ok {
			totalStock = val
		}
	}

	return &domain.ProductStats{
		TotalProducts:   stats.TotalProducts,
		TotalValue:      totalValue,
		TotalCost:       totalCost,
		TotalStock:      totalStock,
		OutOfStockCount: stats.OutOfStockCount,
	}, nil
}
