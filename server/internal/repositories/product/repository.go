package repositories

import (
	"github.com/benitez96/gostore/internal/ports"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
)

var _ ports.ProductRepository = &Repository{}

type Repository struct {
	Queries *sqlc.Queries
}
