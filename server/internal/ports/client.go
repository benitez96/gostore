package ports

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/dto"
)

// ClientService is the interface that have methods to interact with the client entity.
type ClientService interface {
	Create(client *domain.Client) error
	Get(id string) (client *domain.Client, err error)
	Update(id string, updateRequest *dto.UpdateClientRequest) error
	GetAll(search string, limit, offset int, stateIds []int64) (clients *domain.Paginated[*domain.ClientSummary], err error)
	Delete(id string) (err error)
}

// ClientRepository is the interface that have methods to interact with the client entity in the database.
type ClientRepository interface {
	Insert(c *domain.Client) error
	Count(search string, stateIds []int64) (count int, err error)
	GetAll(search string, limit, offset int, stateIds []int64) (clients []*domain.ClientSummary, err error)
	Update(c *domain.Client) (err error)
	Get(id string) (client *domain.Client, err error)
	Delete(id string) (err error)
	UpdateState(clientID string, stateID int) error
}
