package ports

import (
	"context"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/dto"
)

type UserRepository interface {
	GetUsers(ctx context.Context, isActive bool) ([]*domain.UserSummary, error)
	GetAllUsers(ctx context.Context) ([]*domain.UserSummary, error)
	GetUserByID(ctx context.Context, id int64) (*domain.User, error)
	GetUserByUsername(ctx context.Context, username string) (*domain.UserWithPassword, error)
	CreateUser(ctx context.Context, req *dto.CreateUserRequest) (*domain.User, error)
	UpdateUser(ctx context.Context, id int64, req *dto.UpdateUserRequest) error
	UpdateUserPassword(ctx context.Context, id int64, passwordHash string) error
	UpdateUserLastLogin(ctx context.Context, id int64) error
	DeleteUser(ctx context.Context, id int64) error
}

type UserService interface {
	GetUsers(ctx context.Context, isActive bool) ([]*domain.UserSummary, error)
	GetAllUsers(ctx context.Context) ([]*domain.UserSummary, error)
	GetUserByID(ctx context.Context, id int64) (*domain.User, error)
	CreateUser(ctx context.Context, req *dto.CreateUserRequest) (*domain.User, error)
	UpdateUser(ctx context.Context, id int64, req *dto.UpdateUserRequest) error
	UpdateUserPassword(ctx context.Context, id int64, req *dto.UpdateUserPasswordRequest) error
	DeleteUser(ctx context.Context, id int64) error
	Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error)
}
