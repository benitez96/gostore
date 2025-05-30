package utils

import (
	"context"
	"time"
)

func GetContext() (ctx context.Context, cancel context.CancelFunc) {
	ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
	return ctx, cancel
}
