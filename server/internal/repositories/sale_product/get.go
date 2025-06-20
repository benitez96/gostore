package repositories

import (
	"fmt"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/utils"
)


func (r *Repository) GetBySaleID(id string) ([]*domain.SaleProduct, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	parsedId, err := utils.ParseToInt64(id)
	if err != nil {
		return nil, domain.ErrIncorrectID
	}

	productsDB, err := r.Queries.GetSaleProductsBySaleID(ctx, parsedId)
	if err != nil {
		return nil, err
	}

	products := make([]*domain.SaleProduct, 0, len(productsDB))
	for _, p := range productsDB {
		products = append(products, &domain.SaleProduct{
			ID:        	fmt.Sprintf("%d", p.ID),
			Name: 			p.Name,
			Cost: 	 		p.Cost.Float64,
			Price: 	 		p.Price.Float64,
			Quantity: 	p.Quantity,
		})
	}
	return products, nil
}
