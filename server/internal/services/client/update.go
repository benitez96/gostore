package client

import (
	"github.com/benitez96/gostore/internal/dto"
)

func (s *Service) Update(id string, updateRequest *dto.UpdateClientRequest) error {
	// Get the existing client to preserve the ID
	existingClient, err := s.Repo.Get(id)
	if err != nil {
		return err
	}

	// Update the client fields with new values
	existingClient.Name = updateRequest.Name
	existingClient.Lastname = updateRequest.Lastname
	existingClient.Dni = updateRequest.Dni
	existingClient.Email = updateRequest.Email
	existingClient.Phone = updateRequest.Phone
	existingClient.Address = updateRequest.Address

	// Save the updated client
	return s.Repo.Update(existingClient)
}
