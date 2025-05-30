package utils

import (
	"context"
	"errors"

	"github.com/benitez96/gostore/internal/domain"
)


func ManageError(err error) (any, error) {
	if errors.Is(err, context.Canceled) {
		return nil, domain.ErrTimeout
	}
	return nil, err
}
