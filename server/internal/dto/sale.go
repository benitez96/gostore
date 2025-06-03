package dto

import "time"

type CreateSaleDto struct {
	Amount   float64 `json:"amount"`
	ClientID int   `json:"client_id"`
	Date		 time.Time  `json:"date"`
	Quotas	 int  `json:"quotas"`
	QuotaPrice float64 `json:"quota_price"`
	Products []*ProductDto `json:"products"`
}

type ProductDto struct {
	Name	string  `json:"name"`
	Cost	float64 `json:"cost"`
	Price	float64 `json:"price"`
	Quantity int `json:"quantity"`
}
