package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"

	"github.com/benitez96/gostore/internal/middleware"
	"github.com/benitez96/gostore/internal/repositories/db"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	"github.com/benitez96/gostore/internal/services/jwt"
	"github.com/benitez96/gostore/internal/shared/constants"

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

	pdfHandler "github.com/benitez96/gostore/cmd/api/handlers/pdf"
	pdfSvc "github.com/benitez96/gostore/internal/services/pdf"

	userRepository "github.com/benitez96/gostore/internal/repositories/user"
	userSvc "github.com/benitez96/gostore/internal/services/user"

	userHandler "github.com/benitez96/gostore/cmd/api/handlers/user"
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

	// Obtener JWT secret key de variable de entorno o usar una por defecto
	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	if jwtSecretKey == "" {
		jwtSecretKey = "your-secret-key-change-this-in-production" // ¡CAMBIAR EN PRODUCCIÓN!
		log.Println("Warning: Using default JWT secret key. Set JWT_SECRET_KEY environment variable for production.")
	}

	// Inicializar JWT service
	jwtService := jwt.NewService(jwtSecretKey)

	// Inicializar middleware de autenticación
	authMiddleware := middleware.NewAuthMiddleware(jwtService)

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

	userRepository := userRepository.Repository{
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

	userSvc := userSvc.Service{
		Repo:       &userRepository,
		JWTService: jwtService, // Agregar JWT service al servicio de usuario
	}

	// Inicializar el worker service
	workerSvc := workerSvc.Service{
		Queries: sqlc.New(dbConnection),
	}

	clientSvc := clientSvc.Service{
		Repo:    &clientRepository,
		SaleSvc: &saleSvc,
	}

	// Inicializar el servicio PDF
	pdfSvc := pdfSvc.NewService(&paymentSvc, &quotaSvc, &clientSvc, &saleSvc)

	saleHandler := saleHandler.Handler{
		Service: &saleSvc,
	}

	paymentHandler := paymentHandler.Handler{
		Service: &paymentSvc,
	}

	quotaHandler := quotaHandler.Handler{
		Service: &quotaSvc,
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

	userHandler := userHandler.Handler{
		Service: &userSvc,
	}

	workerHandler := workerHandler.Handler{
		Service: &workerSvc,
	}

	pdfHandler := pdfHandler.Handler{
		Service: pdfSvc,
	}

	router := httprouter.New()

	// Public routes (no authentication required)
	router.POST("/api/auth/login", userHandler.Login)
	router.POST("/api/auth/refresh", userHandler.RefreshToken)

	// Protected routes (authentication required)

	// Client routes - Requiere permiso de clientes
	router.POST("/api/clients", authMiddleware.RequirePermission(constants.PermissionClients)(clientHandler.CreateClient))
	router.GET("/api/clients", authMiddleware.RequirePermission(constants.PermissionClients)(clientHandler.GetAllClients))
	router.GET("/api/clients/:id", authMiddleware.RequirePermission(constants.PermissionClients)(clientHandler.GetClientByID))
	router.PUT("/api/clients/:id", authMiddleware.RequirePermission(constants.PermissionClients)(clientHandler.UpdateClient))
	router.DELETE("/api/clients/:id", authMiddleware.RequirePermission(constants.PermissionClients)(clientHandler.DeleteClient))

	// User routes - Requiere permiso de usuarios (solo admin)
	router.POST("/api/users", authMiddleware.RequirePermission(constants.PermissionUsers)(userHandler.CreateUser))
	router.GET("/api/users", authMiddleware.RequirePermission(constants.PermissionUsers)(userHandler.GetUsers))
	router.GET("/api/users/:id", authMiddleware.RequirePermission(constants.PermissionUsers)(userHandler.GetUserByID))
	router.PUT("/api/users/:id", authMiddleware.RequirePermission(constants.PermissionUsers)(userHandler.UpdateUser))
	router.PUT("/api/users/:id/password", authMiddleware.RequirePermission(constants.PermissionUsers)(userHandler.UpdateUserPassword))
	router.DELETE("/api/users/:id", authMiddleware.RequirePermission(constants.PermissionUsers)(userHandler.DeleteUser))

	// Sale routes - Requiere permiso de ventas
	router.POST("/api/sales", authMiddleware.RequirePermission(constants.PermissionSales)(saleHandler.CreateSale))
	router.GET("/api/sales/:id", authMiddleware.RequirePermission(constants.PermissionSales)(saleHandler.GetByID))
	router.DELETE("/api/sales/:id", authMiddleware.RequirePermission(constants.PermissionSales)(saleHandler.DeleteSale))

	// Note routes - Requiere permiso de ventas (las notas están asociadas a ventas)
	router.POST("/api/sales/:sale_id/notes", authMiddleware.RequirePermission(constants.PermissionSales)(noteHandler.AddNote))
	router.DELETE("/api/notes/:id", authMiddleware.RequirePermission(constants.PermissionSales)(noteHandler.DeleteNote))

	// Product routes - Requiere permiso de productos
	router.POST("/api/products", authMiddleware.RequirePermission(constants.PermissionProducts)(productHandler.CreateProduct))
	router.GET("/api/products", authMiddleware.RequirePermission(constants.PermissionProducts)(productHandler.GetAllProducts))
	router.GET("/api/products-stats", authMiddleware.RequirePermission(constants.PermissionProducts)(productHandler.GetProductStats))
	router.GET("/api/products/:id", authMiddleware.RequirePermission(constants.PermissionProducts)(productHandler.GetProductByID))
	router.PUT("/api/products/:id", authMiddleware.RequirePermission(constants.PermissionProducts)(productHandler.UpdateProduct))
	router.DELETE("/api/products/:id", authMiddleware.RequirePermission(constants.PermissionProducts)(productHandler.DeleteProduct))

	// Chart routes - Requiere permiso de dashboard
	router.GET("/api/charts/quotas/monthly-summary", authMiddleware.RequirePermission(constants.PermissionDashboard)(chartHandler.GetQuotaMonthlySummary))
	router.GET("/api/charts/quotas/available-years", authMiddleware.RequirePermission(constants.PermissionDashboard)(chartHandler.GetAvailableYears))
	router.GET("/api/charts/clients/status-count", authMiddleware.RequirePermission(constants.PermissionDashboard)(chartHandler.GetClientStatusCount))
	router.GET("/api/charts/dashboard-stats", authMiddleware.RequirePermission(constants.PermissionDashboard)(chartHandler.GetDashboardStats))

	// Payment routes - Requiere permiso de ventas (los pagos están asociados a ventas)
	router.POST("/api/payments", authMiddleware.RequirePermission(constants.PermissionSales)(paymentHandler.CreatePayment))
	router.DELETE("/api/payments/:id", authMiddleware.RequirePermission(constants.PermissionSales)(paymentHandler.DeletePayment))

	// PDF routes - Requiere permiso de ventas para generar PDFs
	router.POST("/api/pdf/generate-receipt", authMiddleware.RequirePermission(constants.PermissionSales)(pdfHandler.GeneratePaymentReceipt))
	router.GET("/api/pdf/venta/:id", authMiddleware.RequirePermission(constants.PermissionSales)(pdfHandler.GenerateSaleSheet))
	router.GET("/api/pdf/libro-ventas", authMiddleware.RequirePermission(constants.PermissionSales)(pdfHandler.GenerateSalesBook))

	// Quota routes - Requiere permiso de ventas (las cuotas están asociadas a ventas)
	router.PUT("/api/quotas/:id", authMiddleware.RequirePermission(constants.PermissionSales)(quotaHandler.UpdateQuota))

	// Worker routes - Requiere permiso de usuarios (solo admin)
	router.POST("/api/worker/update-states", authMiddleware.RequirePermission(constants.PermissionUsers)(workerHandler.RunStateUpdate))

	// Iniciar el worker en una goroutine separada
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		workerSvc.RunStateUpdateWorker(ctx)
	}()

	fmt.Println("🚀 Starting server on port 8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(router)))
}
