package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"

	"github.com/benitez96/gostore/internal/repositories/db"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"

	clientHandler "github.com/benitez96/gostore/cmd/api/handlers/client"
	paymentHandler "github.com/benitez96/gostore/cmd/api/handlers/payment"
	prodHandler "github.com/benitez96/gostore/cmd/api/handlers/product"
	quotaHandler "github.com/benitez96/gostore/cmd/api/handlers/quota"
	saleHandler "github.com/benitez96/gostore/cmd/api/handlers/sale"
	clientRepository "github.com/benitez96/gostore/internal/repositories/client"
	clientSvc "github.com/benitez96/gostore/internal/services/client"

	// repositories

	paymentRepository "github.com/benitez96/gostore/internal/repositories/payment"
	quotaRepository "github.com/benitez96/gostore/internal/repositories/quota"
	saleRepository "github.com/benitez96/gostore/internal/repositories/sale"
	saleProductRepository "github.com/benitez96/gostore/internal/repositories/sale_product"
	paymentSvc "github.com/benitez96/gostore/internal/services/payment"
	quotaSvc "github.com/benitez96/gostore/internal/services/quota"
	saleSvc "github.com/benitez96/gostore/internal/services/sale"

	noteRepository "github.com/benitez96/gostore/internal/repositories/note"
	noteSvc "github.com/benitez96/gostore/internal/services/note"

	noteHandler "github.com/benitez96/gostore/cmd/api/handlers/note"

	productRepository "github.com/benitez96/gostore/internal/repositories/product"
	productSvc "github.com/benitez96/gostore/internal/services/product"

	chartRepository "github.com/benitez96/gostore/internal/repositories/chart"
	chartSvc "github.com/benitez96/gostore/internal/services/chart"

	chartHandler "github.com/benitez96/gostore/cmd/api/handlers/chart"

	workerHandler "github.com/benitez96/gostore/cmd/api/handlers/worker"
	workerSvc "github.com/benitez96/gostore/internal/services/worker"

	stateUpdaterSvc "github.com/benitez96/gostore/internal/services/state-updater"
)

// CORS middleware
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow requests from the frontend
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {

	dbConnection, err := db.Connect()
	if err != nil {
		log.Fatal("No se pudo conectar a la base de datos:", err)
	}
	defer dbConnection.Close()

	noteRepository := noteRepository.Repository{
		Queries: sqlc.New(dbConnection),
	}

	saleRepository := saleRepository.Repository{
		Queries:  sqlc.New(dbConnection),
		DB:       dbConnection,
		NoteRepo: &noteRepository,
	}

	saleProductRepository := saleProductRepository.Repository{
		Queries: sqlc.New(dbConnection),
		DB:      dbConnection,
	}

	quotaRepository := quotaRepository.Repository{
		Queries: sqlc.New(dbConnection),
		DB:      dbConnection,
	}
	paymentRepository := paymentRepository.Repository{
		Queries: sqlc.New(dbConnection),
		DB:      dbConnection,
	}

	clientRepository := clientRepository.Repository{
		Queries: sqlc.New(dbConnection),
	}

	productRepository := productRepository.Repository{
		Queries: sqlc.New(dbConnection),
	}

	chartRepository := chartRepository.Repository{
		Queries: sqlc.New(dbConnection),
	}

	// Inicializar el StateUpdater service
	stateUpdaterSvc := stateUpdaterSvc.Service{
		QuotaRepo:   &quotaRepository,
		SaleRepo:    &saleRepository,
		ClientRepo:  &clientRepository,
		PaymentRepo: &paymentRepository,
	}

	saleSvc := saleSvc.Service{
		Sr:           &saleRepository,
		Spr:          &saleProductRepository,
		Qr:           &quotaRepository,
		Pr:           &paymentRepository,
		ClientRepo:   &clientRepository,
		StateUpdater: &stateUpdaterSvc,
	}

	paymentSvc := paymentSvc.Service{
		Repo:         &paymentRepository,
		QuotaRepo:    &quotaRepository,
		SaleRepo:     &saleRepository,
		ClientRepo:   &clientRepository,
		StateUpdater: &stateUpdaterSvc,
	}

	quotaSvc := quotaSvc.Service{
		Repo:         &quotaRepository,
		StateUpdater: &stateUpdaterSvc,
	}

	noteSvc := noteSvc.Service{
		Repo: &noteRepository,
	}

	productSvc := productSvc.Service{
		Repo: &productRepository,
	}

	chartSvc := chartSvc.Service{
		Repo: &chartRepository,
	}

	// Inicializar el worker service
	workerSvc := workerSvc.Service{
		Queries: sqlc.New(dbConnection),
	}

	saleHandler := saleHandler.Handler{
		Service: &saleSvc,
	}

	paymentHandler := paymentHandler.Handler{
		Service: &paymentSvc,
	}

	quotaHandler := quotaHandler.Handler{
		Service: &quotaSvc,
	}

	clientSvc := clientSvc.Service{
		Repo:    &clientRepository,
		SaleSvc: &saleSvc,
	}
	clientHandler := clientHandler.Handler{
		Service: &clientSvc,
	}

	noteHandler := noteHandler.Handler{
		Service: &noteSvc,
	}

	productHandler := prodHandler.Handler{
		Service: &productSvc,
	}

	chartHandler := chartHandler.Handler{
		Service: &chartSvc,
	}

	workerHandler := workerHandler.Handler{
		Service: &workerSvc,
	}

	router := httprouter.New()

	// client routes
	router.POST("/api/clients", clientHandler.CreateClient)
	router.GET("/api/clients", clientHandler.GetAllClients)
	router.GET("/api/clients/:id", clientHandler.GetClientByID)
	router.PUT("/api/clients/:id", clientHandler.UpdateClient)
	router.DELETE("/api/clients/:id", clientHandler.DeleteClient)

	// sale routes
	router.POST("/api/sales", saleHandler.CreateSale)
	router.GET("/api/sales/:id", saleHandler.GetByID)
	router.DELETE("/api/sales/:id", saleHandler.DeleteSale)

	// note routes
	router.POST("/api/sales/:sale_id/notes", noteHandler.AddNote)
	router.DELETE("/api/notes/:id", noteHandler.DeleteNote)

	// product routes
	router.POST("/api/products", productHandler.CreateProduct)
	router.GET("/api/products", productHandler.GetAllProducts)
	router.GET("/api/products/:id", productHandler.GetProductByID)
	router.PUT("/api/products/:id", productHandler.UpdateProduct)
	router.DELETE("/api/products/:id", productHandler.DeleteProduct)

	// chart routes
	router.GET("/api/charts/quotas/monthly-summary", chartHandler.GetQuotaMonthlySummary)
	router.GET("/api/charts/quotas/available-years", chartHandler.GetAvailableYears)
	router.GET("/api/charts/clients/status-count", chartHandler.GetClientStatusCount)
	router.GET("/api/charts/dashboard-stats", chartHandler.GetDashboardStats)

	// payment routes
	router.POST("/api/payments", paymentHandler.CreatePayment)
	router.DELETE("/api/payments/:id", paymentHandler.DeletePayment)

	// quota routes
	router.PUT("/api/quotas/:id", quotaHandler.UpdateQuota)

	// worker routes
	router.POST("/api/worker/update-states", workerHandler.RunStateUpdate)

	// Iniciar el worker en una goroutine separada
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		workerSvc.RunStateUpdateWorker(ctx)
	}()

	fmt.Println("🚀 Starting server on port 8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(router)))
}
