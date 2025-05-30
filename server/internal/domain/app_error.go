package domain

import (
	"errors"
	"fmt"
	"log"
)

const (
	ErrCodeDuplicateKey        = "duplicate_key"
	ErrCodeInternalServerError = "internal_server_error"
	ErrCodeInvalidParams       = "invalid_params"
	ErrCodeNotFound            = "not_found"
	ErrCodeTimeout             = "timeout"
)

var (
	ErrDuplicateKey = errors.New("duplicate key error")
	ErrIncorrectID  = errors.New("incorrect id error")
	ErrNotFound     = errors.New("record not found error")
	ErrTimeout      = errors.New("timeout error")
)

// AppError is a custom error type that implements the error interface
type AppError struct {
	Code string `json:"code"`
	Msg  string `json:"msg"`
}

// NewAppError creates a new AppError with the given code and message.
func NewAppError(code string, msg string) AppError {
	return AppError{
		Code: code,
		Msg:  msg,
	}
}

// Error returns a string representation of the error. It is part of the error interface.
func (e AppError) Error() string {
	return fmt.Sprintf("%s: %s", e.Code, e.Msg)
}

func ManageError(err error) error {
	appErr := AppError { Msg: err.Error() }

	switch {
	case errors.Is(err, ErrDuplicateKey):
		log.Println("duplicate key")
		appErr.Code = ErrCodeDuplicateKey

	case errors.Is(err, ErrIncorrectID):
		log.Println("incorrect id error")
		appErr.Code = ErrCodeDuplicateKey
	case errors.Is(err, ErrNotFound):
		log.Println("not found error")
		appErr.Code = ErrCodeNotFound
	case errors.Is(err, ErrTimeout):
		log.Println("timeout error")
		appErr.Code = ErrCodeTimeout
	default:
		log.Println(err.Error())
		appErr = AppError{
			Code: ErrCodeInternalServerError,
			Msg:  "Server Error",
		}
	}

	return appErr
}
