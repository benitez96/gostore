package domain

import "time"

type UserSummary struct {
	ID          int64      `json:"id"`
	Username    string     `json:"username"`
	FirstName   string     `json:"firstName"`
	LastName    string     `json:"lastName"`
	Permissions int64      `json:"permissions"`
	IsActive    bool       `json:"is_active"`
	LastLoginAt *time.Time `json:"last_login_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

type User struct {
	ID          int64      `json:"id"`
	Username    string     `json:"username"`
	FirstName   string     `json:"firstName"`
	LastName    string     `json:"lastName"`
	Permissions int64      `json:"permissions"`
	IsActive    bool       `json:"is_active"`
	LastLoginAt *time.Time `json:"last_login_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type UserWithPassword struct {
	User
	PasswordHash string `json:"-"`
}
