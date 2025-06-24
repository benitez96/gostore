package client

import (
	"errors"
	"fmt"
	"log"
	"sync"

	"github.com/benitez96/gostore/internal/domain"
)

func (s Service) GetAll(search string, limit, offset int, stateIds []int64) (clients *domain.Paginated[*domain.ClientSummary], err error) {

	var (
		res   []*domain.ClientSummary
		count int
		errC  error
		wg    sync.WaitGroup
	)
	wg.Add(2)

	if limit <= 0 {
		limit = 10
	}

	// Fetch clients
	go func() {
		defer wg.Done()
		var err error
		res, err = s.Repo.GetAll(search, limit, offset, stateIds)
		if err != nil {
			errC = fmt.Errorf("unexpected error getting clients: %w", err)
		}
	}()

	// Fetch count
	go func() {
		defer wg.Done()
		var err error
		count, err = s.Repo.Count(search, stateIds)
		if err != nil {
			errC = fmt.Errorf("unexpected error counting clients: %w", err)
		}
	}()

	wg.Wait()

	if errC != nil {
		return nil, errC
	}

	result := &domain.Paginated[*domain.ClientSummary]{
		Results: res,
		Count:   count,
	}

	return result, nil
}

func (s Service) Get(id string) (*domain.Client, error) {
	if id == "" {
		return nil, domain.NewAppError(
			domain.ErrCodeInvalidParams,
			"client ID cannot be empty")
	}

	var (
		client *domain.Client
		sales  []*domain.SaleSummary
		errC   error
		errS   error
		wg     sync.WaitGroup
	)

	wg.Add(2)

	// Fetch client
	go func() {
		defer wg.Done()
		var err error
		client, err = s.Repo.Get(id)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				errC = domain.NewAppError(domain.ErrCodeNotFound,
					fmt.Sprintf("client with ID %s not found", id))
			} else {
				log.Println(err.Error())
				errC = fmt.Errorf("unexpected error getting client by ID: %w", err)
			}
		}
	}()

	// Fetch sales
	go func() {
		defer wg.Done()
		var err error
		sales, err = s.SaleSvc.GetByClientID(id)
		if err != nil {
			errS = err
		}
	}()

	wg.Wait()

	if errC != nil {
		return nil, errC
	}
	if errS != nil {
		return nil, errS
	}

	client.Sales = sales

	return client, nil
}
