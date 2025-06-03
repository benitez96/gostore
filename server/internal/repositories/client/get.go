package repositories

import (
	"context"
	"errors"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/repositories/utils"
)



func (r *Repository) GetAll(search string, limit, offset int) ([]*domain.ClientSummary, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	rows, err := r.Queries.GetClients(ctx, sqlc.GetClientsParams{
		Name:     startsWith(search),
		Lastname: startsWith(search),
		Dni:      startsWith(search),
		Limit:    int64(limit),
		Offset:   int64(offset),
	})

	if err != nil {
		manageError(err)
	}

	clients := make([]*domain.ClientSummary, len(rows))
	for i, result := range rows {
		clients[i] = &domain.ClientSummary{
			ID:			 	result.ID,
			Name:     result.Name,
			Lastname: result.Lastname,
			Dni:      result.Dni,
			State: &domain.State{
				ID: result.Stateid,
				Description: result.Statedescription,
			},
		}
	}

	return clients, nil
}

func (r *Repository) Get(id string) (*domain.Client, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	clientID, err := utils.ParseToInt64(id)
	if err != nil {return nil, err}

	res, err := r.Queries.GetClientByID(ctx, clientID)

	if err != nil {
		return nil, domain.ErrNotFound
	}

	client := &domain.Client{
		ID:        res.ID,
		Name:      res.Name,
		Lastname:  res.Lastname,
		Dni:       res.Dni,
		State: &domain.State{
			ID:          res.StateID,
			Description: res.StateDescription,
		},
		Email: utils.ParseToEmptyString(res.Email),
		Phone: utils.ParseToEmptyString(res.Phone),
		Address: utils.ParseToEmptyString(res.Address),
	}

	return client, nil
}

func startsWith (seach string) string {
	return seach + "%"
}

func manageError(err error) (any, error) {
	if errors.Is(err, context.Canceled) {
		return nil, domain.ErrTimeout
	}
	return nil, err
}
