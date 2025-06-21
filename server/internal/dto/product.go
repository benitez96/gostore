package dto

type CreateProductRequest struct {
	Name  string  `json:"name"`
	Cost  float64 `json:"cost"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}

type UpdateProductRequest struct {
	Name  string  `json:"name"`
	Cost  float64 `json:"cost"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}
