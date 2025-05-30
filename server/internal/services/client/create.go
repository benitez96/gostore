package client

import (
	"github.com/benitez96/gostore/internal/domain"
)

func (s Service) Create (client *domain.Client) error {

	err := s.Repo.Insert(&domain.Client{
		Name: client.Name,
		Lastname: client.Lastname,
		Dni: client.Dni,
		Email: client.Email,
		Phone: client.Phone,
		Address: client.Address,
	})

	if err != nil {
		return domain.ManageError(err)
	}

	return nil

}
