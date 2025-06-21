package repositories

import (
	"github.com/benitez96/gostore/internal/domain"
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
