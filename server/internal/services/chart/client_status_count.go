package chart

import (
	"github.com/benitez96/gostore/internal/domain"
)

func (s *Service) GetClientStatusCount() ([]*domain.ClientStatusCount, error) {
	return s.Repo.GetClientStatusCount()
}
