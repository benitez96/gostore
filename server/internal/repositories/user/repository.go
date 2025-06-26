package repositories

import (
	"github.com/benitez96/gostore/internal/ports"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
)

// Make sure Repository implements ports.UserRepository
// at compile time
var _ ports.UserRepository = &Repository{}

type Repository struct {
	Queries *sqlc.Queries
}
