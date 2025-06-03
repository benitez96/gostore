package sale

import (
	"github.com/benitez96/gostore/internal/dto"
)

func (s Service) Create(dto *dto.CreateSaleDto) (int64, error) {
	return s.Repo.CreateSaleWithProductsAndQuotas(dto)
}
