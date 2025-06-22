package ports

import "context"

// WorkerService define la interfaz para el servicio del worker
type WorkerService interface {
	RunStateUpdateWorker(ctx context.Context)
}
