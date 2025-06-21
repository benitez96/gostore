package note

import (
	"github.com/benitez96/gostore/internal/ports"
)

type Service struct {
	Repo ports.NoteRepository
}
