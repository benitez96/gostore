package client

import (
	"errors"
	"fmt"
	"log"

	"github.com/benitez96/gostore/internal/domain"
)


func (s Service) Get(id string) (client *domain.Client, err error){

	return nil, nil
}


func (s Service) GetAll(search string, limit, offset int) (clients *domain.Paginated[*domain.ClientSummary], err error){
	if limit <= 0 {
		limit = 10
	}

	res, err := s.Repo.GetAll(search, limit, offset)

	if err != nil {
		if errors.Is(err, domain.ErrTimeout) {
			return nil, domain.NewAppError(
				domain.ErrCodeTimeout,
				"timeout error, try again later")
		}
		log.Println(err.Error())
		return nil, fmt.Errorf("unexpected error getting clients: %w", err)
	}

	return res, err
}

func (s Service) GetByID(id string) (client *domain.Client, err error) {

	if id == "" {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"client ID cannot be empty")
	}

	client, err = s.Repo.Get(id)

	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, domain.NewAppError(
				domain.ErrCodeNotFound,
				fmt.Sprintf("client with ID %s not found", id))
		}
		log.Println(err.Error())
		return nil, fmt.Errorf("unexpected error getting client by ID: %w", err)
	}

	return client, nil


}
