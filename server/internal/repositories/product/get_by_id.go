package repositories

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) GetByID(id string) (*domain.Product, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	productID, err := utils.ParseToInt64(id)
	if err != nil {
		return nil, err
	}

	product, err := r.Queries.GetProductByID(ctx, productID)
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
