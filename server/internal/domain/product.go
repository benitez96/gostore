package domain

import "time"

type Product struct {
	ID        any       `json:"id"`
	Name      string    `json:"name"`
	Cost      float64   `json:"cost"`
	Price     float64   `json:"price"`
	Stock     int       `json:"stock"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ProductStats represents statistics about the product catalog
type ProductStats struct {
	TotalProducts   int64   `json:"total_products"`
	TotalValue      float64 `json:"total_value"`
	TotalCost       float64 `json:"total_cost"`
	TotalStock      int64   `json:"total_stock"`
	OutOfStockCount int64   `json:"out_of_stock_count"`
}
