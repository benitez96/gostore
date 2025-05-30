package repositories

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)



func (r *Repository) GetAll(search string, limit, offset int) (*domain.Paginated[*domain.ClientSummary], error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	var count int64
	var results []sqlc.GetClientsRow

	var wg sync.WaitGroup
	wg.Add(2)

	errs := make(chan error, 2)
	go func() {
		defer wg.Done()
		var err error
		count, err = r.Queries.CountClients(ctx, sqlc.CountClientsParams{
			Name:     shouldContain(search),
			Lastname: shouldContain(search),
			Dni:      shouldContain(search),
		})
		errs <- err
	}()

	go func() {
		defer wg.Done()
		var err error
		results, err = r.Queries.GetClients(ctx, sqlc.GetClientsParams{
			Name:     shouldContain(search),
			Lastname: shouldContain(search),
			Dni:      shouldContain(search),
			Limit:    int64(limit),
			Offset:   int64(offset),
		})
		errs <- err
	}()
	wg.Wait()

	if err := <-errs; err != nil {
		manageError(err)
	}
	if err := <-errs; err != nil {
		manageError(err)
	}

	clients := &domain.Paginated[*domain.ClientSummary]{
		Total:   int(count),
		Results: make([]*domain.ClientSummary, 0, len(results)),
	}

	for _, result := range results {
		client := &domain.ClientSummary{
			ID:			 	result.ID,
			Name:     result.Name,
			Lastname: result.Lastname,
			Dni:      result.Dni,
			State: &domain.State{
				ID: result.Stateid,
				Description: result.Statedescription,
			},
		}
		clients.Results = append(clients.Results, client)
	}

	return clients, nil
}

func (r *Repository) Get(id string) (client *domain.Client, err error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	clientID, err := utils.ParseToInt64(id)
	if err != nil {return nil, err}

	res, err := r.Queries.GetClientByID(ctx, clientID)

	if err != nil {
		return nil, domain.ErrNotFound
	}

	fmt.Println("res", res)

	// go func() { 
	// 	products, _ := r.Queries.GetProductsByClientID(ctx, clientID) 
	// }()
	// go func() { 
	// 	quotas, _ := r.Queries.GetQuotasByClientID(ctx, clientID) 
	// }()
	// go func() { 
	// 	payments, _ := r.Queries.GetPaymentsByClientID(ctx, clientID) 
	// }()
	// go func() { 
	// 	sales, _ := r.Queries.GetSalesByClientID(ctx, clientID) 
	// }()

	return nil, nil
}

func shouldContain (seach string) string {
	return "%" + seach + "%"
}

func manageError(err error) (any, error) {
	if errors.Is(err, context.Canceled) {
		return nil, domain.ErrTimeout
	}
	return nil, err
}
