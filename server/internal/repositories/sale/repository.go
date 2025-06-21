package repositories

import (
	"database/sql"

	"github.com/benitez96/gostore/internal/ports"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
)

// Make sure Repository implements ports.ClientRepository
// at compile time
var _ ports.SaleRepository = &Repository{}

type Repository struct {
	Queries  *sqlc.Queries
	DB       *sql.DB
	NoteRepo ports.NoteRepository
}
