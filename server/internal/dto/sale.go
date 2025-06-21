package dto

import (
	"time"

	"github.com/benitez96/gostore/internal/domain"
)

type CreateSaleDto struct {
	Amount     float64       `json:"amount"`
	ClientID   int           `json:"client_id"`
	Date       time.Time     `json:"date"`
	Quotas     int           `json:"quotas"`
	QuotaPrice float64       `json:"quota_price"`
	Products   []*ProductDto `json:"products"`
}

type ProductDto struct {
	ID       int64   `json:"id,omitempty"`
	Name     string  `json:"name"`
	Cost     float64 `json:"cost"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
}

type CreateSaleRequest struct {
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Date        string  `json:"date"`
	ClientID    string  `json:"client_id"`
	Products    []struct {
		ProductID string  `json:"product_id"`
		Quantity  int     `json:"quantity"`
		Price     float64 `json:"price"`
	} `json:"products"`
}

type SaleResponse struct {
	ID          any            `json:"id"`
	Description string         `json:"description"`
	Amount      float64        `json:"amount"`
	IsPaid      bool           `json:"is_paid"`
	Date        *string        `json:"date"`
	StateID     int            `json:"state"`
	Products    []*SaleProduct `json:"products"`
	Quotas      []*Quota       `json:"quotas"`
	Notes       []*Note        `json:"notes"`
}

type SaleProduct struct {
	ID       any     `json:"id"`
	Name     string  `json:"name"`
	Cost     float64 `json:"cost"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
}

type Quota struct {
	ID       any        `json:"id"`
	Number   uint       `json:"number"`
	Amount   float64    `json:"amount"`
	IsPaid   bool       `json:"is_paid"`
	StateID  int        `json:"state"`
	DueDate  *string    `json:"due_date"`
	Payments []*Payment `json:"payments"`
}

type Payment struct {
	ID     any     `json:"id"`
	Amount float64 `json:"amount"`
	Date   *string `json:"date"`
}

type Note struct {
	ID        any     `json:"id"`
	Content   string  `json:"content"`
	CreatedAt *string `json:"created_at"`
	UpdatedAt *string `json:"updated_at"`
}

// ToSaleResponse converts a domain Sale to a SaleResponse DTO
func ToSaleResponse(sale *domain.Sale) *SaleResponse {
	dateStr := ""
	if sale.Date != nil {
		dateStr = sale.Date.Format(time.RFC3339)
	}

	products := make([]*SaleProduct, len(sale.Products))
	for i, p := range sale.Products {
		products[i] = &SaleProduct{
			ID:       p.ID,
			Name:     p.Name,
			Cost:     p.Cost,
			Price:    p.Price,
			Quantity: int(p.Quantity),
		}
	}

	quotas := make([]*Quota, len(sale.Quotas))
	for i, q := range sale.Quotas {
		dueDateStr := ""
		if q.DueDate != nil {
			dueDateStr = q.DueDate.Format(time.RFC3339)
		}

		payments := make([]*Payment, len(q.Payments))
		for j, p := range q.Payments {
			paymentDateStr := ""
			if p.Date != nil {
				paymentDateStr = p.Date.Format(time.RFC3339)
			}

			payments[j] = &Payment{
				ID:     p.ID,
				Amount: p.Amount,
				Date:   &paymentDateStr,
			}
		}

		quotas[i] = &Quota{
			ID:       q.ID,
			Number:   q.Number,
			Amount:   q.Amount,
			IsPaid:   q.IsPaid,
			StateID:  q.StateID,
			DueDate:  &dueDateStr,
			Payments: payments,
		}
	}

	notes := make([]*Note, len(sale.Notes))
	for i, n := range sale.Notes {
		createdAtStr := n.CreatedAt.Format(time.RFC3339)
		updatedAtStr := n.UpdatedAt.Format(time.RFC3339)

		notes[i] = &Note{
			ID:        n.ID,
			Content:   n.Content,
			CreatedAt: &createdAtStr,
			UpdatedAt: &updatedAtStr,
		}
	}

	return &SaleResponse{
		ID:          sale.ID,
		Description: sale.Description,
		Amount:      sale.Amount,
		IsPaid:      sale.IsPaid,
		Date:        &dateStr,
		StateID:     sale.StateID,
		Products:    products,
		Quotas:      quotas,
		Notes:       notes,
	}
}
