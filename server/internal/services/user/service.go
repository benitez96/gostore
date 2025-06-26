package user

import "github.com/benitez96/gostore/internal/ports"

// Make sure Service implements the UserService interface
// at compile time.
var _ ports.UserService = &Service{}

// Service is a struct that represents the service for the user entity.
type Service struct {
	Repo ports.UserRepository
}
