package product

import (
	"errors"
)

func (s *Service) Delete(id string) error {
	// Validation logic
	if id == "" {
		return errors.New("product ID is required")
	}

	return s.Repo.Delete(id)
}
