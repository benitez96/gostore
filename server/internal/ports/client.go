package ports

import (
	"github.com/benitez96/gostore/internal/domain"
)

// ClientService is the interface that have methods to interact with the client entity.
type ClientService interface {
	Create(client *domain.Client) error
	Get(id string) (client *domain.Client, err error)
	Update(client *domain.Client) (err error)
	GetAll(search string, limit, offset int) (clients *domain.Paginated[*domain.ClientSummary], err error)
	Delete(id string) (err error)
}

// ClientRepository is the interface that have methods to interact with the client entity in the database.
type ClientRepository interface {
	Insert(c *domain.Client) error
	Count(search string) (count int, err error)
	GetAll(search string, limit, offset int) (clients []*domain.ClientSummary, err error)
	Update(c *domain.Client) (err error)
	Get(id string) (client *domain.Client, err error)
	Delete(id string) (err error)
}
