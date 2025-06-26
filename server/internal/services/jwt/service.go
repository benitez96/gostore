package jwt

import (
	"fmt"
	"time"

	"github.com/benitez96/gostore/internal/domain"
	"github.com/golang-jwt/jwt/v5"
)

type Service struct {
	secretKey string
}

type Claims struct {
	UserID      int64  `json:"user_id"`
	Username    string `json:"username"`
	Permissions int64  `json:"permissions"`
	jwt.RegisteredClaims
}

func NewService(secretKey string) *Service {
	return &Service{
		secretKey: secretKey,
	}
}

// GenerateToken genera un nuevo JWT token para el usuario
func (s *Service) GenerateToken(user *domain.User) (string, error) {
	// Crear claims
	claims := Claims{
		UserID:      user.ID,
		Username:    user.Username,
		Permissions: user.Permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // Token válido por 24 horas
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "gostore",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	// Crear token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Firmar token
	tokenString, err := token.SignedString([]byte(s.secretKey))
	if err != nil {
		return "", fmt.Errorf("error signing token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken valida un JWT token y devuelve las claims
func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Verificar que el método de firma sea correcto
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("error parsing token: %w", err)
	}

	// Verificar que el token sea válido
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	// Extraer claims
	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}

// GenerateRefreshToken genera un token de refresh con mayor duración
func (s *Service) GenerateRefreshToken(user *domain.User) (string, error) {
	claims := Claims{
		UserID:      user.ID,
		Username:    user.Username,
		Permissions: user.Permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // Token válido por 7 días
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "gostore-refresh",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.secretKey))
	if err != nil {
		return "", fmt.Errorf("error signing refresh token: %w", err)
	}

	return tokenString, nil
}
