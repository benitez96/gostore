package pdf

import "time"

// WorkerPoolConfig contiene la configuración para el pool de workers
type WorkerPoolConfig struct {
	NumWorkers int           // Número de workers concurrentes
	Timeout    time.Duration // Timeout total para el procesamiento
	BatchSize  int           // Tamaño del lote por worker (reservado para futuro uso)
	ErrorLimit float64       // Porcentaje máximo de errores permitidos (0.0-1.0)
}

// DefaultWorkerPoolConfig retorna la configuración por defecto para el pool de workers
func DefaultWorkerPoolConfig() *WorkerPoolConfig {
	return &WorkerPoolConfig{
		NumWorkers: 10,               // 10 workers concurrentes
		Timeout:    10 * time.Minute, // 10 minutos timeout
		BatchSize:  50,               // 50 ventas por lote
		ErrorLimit: 0.5,              // Máximo 50% de errores
	}
}

// SmallWorkloadConfig configuración para cargas pequeñas (< 100 ventas)
func SmallWorkloadConfig() *WorkerPoolConfig {
	return &WorkerPoolConfig{
		NumWorkers: 5,
		Timeout:    5 * time.Minute,
		BatchSize:  20,
		ErrorLimit: 0.3,
	}
}

// LargeWorkloadConfig configuración para cargas grandes (> 500 ventas)
func LargeWorkloadConfig() *WorkerPoolConfig {
	return &WorkerPoolConfig{
		NumWorkers: 15,
		Timeout:    20 * time.Minute,
		BatchSize:  100,
		ErrorLimit: 0.7,
	}
}
