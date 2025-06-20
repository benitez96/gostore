package repositories

import (
	"fmt"
	"strings"

	"github.com/benitez96/gostore/internal/dto"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) CreateSaleWithProductsAndQuotas(dto *dto.CreateSaleDto) (int64, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}

	qtx := r.Queries.WithTx(tx)

	saleID, err := qtx.CreateSale(ctx, sqlc.CreateSaleParams{
		Description: buildSaleDescription(dto.Products),
		Amount:      dto.Amount,
		ClientID:    int64(dto.ClientID),
		Date:        dto.Date,
	})
	if err != nil {
		tx.Rollback()
		return 0, err
	}

	for _, p := range dto.Products {

		if p.ID != 0 {
			err = qtx.UpdateProductStock(ctx, sqlc.UpdateProductStockParams{
				ID:    p.ID,
				Stock: int64(p.Quantity),
			})
		}

		err = qtx.CreateSaleProduct(ctx, sqlc.CreateSaleProductParams{
			Name:     p.Name,
			Cost:     utils.ParseToSqlNullFloat64(p.Cost),
			Price:    utils.ParseToSqlNullFloat64(p.Price),
			Quantity: int64(p.Quantity),
			SaleID:   saleID,
			ClientID: int64(dto.ClientID),
		})

		if err != nil {
			tx.Rollback()
			return 0, err
		}
	}

	for i := 0; i < dto.Quotas; i++ {
		err = qtx.CreateQuota(ctx, sqlc.CreateQuotaParams{
			Number:   int64(i + 1),
			Amount:   dto.QuotaPrice,
			DueDate:  dto.Date.AddDate(0, i, 0),
			SaleID:   saleID,
			ClientID: int64(dto.ClientID),
		})
		if err != nil {
			tx.Rollback()
			return 0, err
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return saleID, nil
}


func buildSaleDescription(products []*dto.ProductDto) string {
	var parts []string
	for _, p := range products {
		parts = append(parts, fmt.Sprintf("%s (%d)", p.Name, p.Quantity))
	}
	return strings.Join(parts, ", ")
}
