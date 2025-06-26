package dto

type CreateUserRequest struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Permissions int64  `json:"permissions"`
}

type UpdateUserRequest struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Permissions int64  `json:"permissions"`
	IsActive    *bool  `json:"is_active,omitempty"`
}

type UpdateUserPasswordRequest struct {
	Password string `json:"password"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	User         *UserResponse `json:"user"`
	Token        string        `json:"token,omitempty"`
	RefreshToken string        `json:"refresh_token,omitempty"`
	Message      string        `json:"message"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type RefreshTokenResponse struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	Message      string `json:"message"`
}

type UserResponse struct {
	ID          int64  `json:"id"`
	Username    string `json:"username"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Permissions int64  `json:"permissions"`
	IsActive    bool   `json:"is_active"`
}
