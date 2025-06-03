package sale

import (
	"github.com/benitez96/gostore/internal/domain"
)

func (s Service) GetByClientID(id string) (sale []*domain.SaleSummary, err error){

	res, err := s.Repo.GetByClientID(id)
	return res, err

}
