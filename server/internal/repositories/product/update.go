package repositories

import (
	"database/sql"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) Update(id string, name string, cost, price float64, stock int) (*domain.Product, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	productID, err := utils.ParseToInt64(id)
	if err != nil {
		return nil, err
	}

	product, err := r.Queries.UpdateProduct(ctx, sqlc.UpdateProductParams{
		Name:  name,
		Cost:  sql.NullFloat64{Float64: cost, Valid: true},
		Price: sql.NullFloat64{Float64: price, Valid: true},
		Stock: int64(stock),
		ID:    productID,
	})
	if err != nil {
		return nil, err
	}

	return &domain.Product{
		ID:        product.ID,
		Name:      product.Name,
		Cost:      product.Cost.Float64,
		Price:     product.Price.Float64,
		Stock:     int(product.Stock),
		CreatedAt: product.CreatedAt,
		UpdatedAt: product.UpdatedAt,
	}, nil
}
