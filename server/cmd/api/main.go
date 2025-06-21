package main

import (
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
)

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

	saleSvc := saleSvc.Service{
		Sr:         &saleRepository,
		Spr:        &saleProductRepository,
		Qr:         &quotaRepository,
		Pr:         &paymentRepository,
		ClientRepo: &clientRepository,
	}

	paymentSvc := paymentSvc.Service{
		Repo:       &paymentRepository,
		QuotaRepo:  &quotaRepository,
		SaleRepo:   &saleRepository,
		ClientRepo: &clientRepository,
	}

	quotaSvc := quotaSvc.Service{
		Repo: &quotaRepository,
	}

	noteSvc := noteSvc.Service{
		Repo: &noteRepository,
	}

	productSvc := productSvc.Service{
		Repo: &productRepository,
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

	router := httprouter.New()

	// client routes
	router.POST("/clients", clientHandler.CreateClient)
	router.GET("/clients", clientHandler.GetAllClients)
	router.GET("/clients/:id", clientHandler.GetClientByID)
	router.PUT("/clients/:id", clientHandler.UpdateClient)
	router.DELETE("/clients/:id", clientHandler.DeleteClient)

	// sale routes
	router.POST("/sales", saleHandler.CreateSale)
	router.GET("/sales/:id", saleHandler.GetByID)
	router.DELETE("/sales/:id", saleHandler.DeleteSale)

	// note routes
	router.POST("/sales/:sale_id/notes", noteHandler.AddNote)
	router.DELETE("/notes/:id", noteHandler.DeleteNote)

	// product routes
	router.POST("/products", productHandler.CreateProduct)
	router.GET("/products", productHandler.GetAllProducts)
	router.GET("/products/:id", productHandler.GetProductByID)
	router.PUT("/products/:id", productHandler.UpdateProduct)
	router.DELETE("/products/:id", productHandler.DeleteProduct)

	// payment routes
	router.POST("/payments", paymentHandler.CreatePayment)
	router.DELETE("/payments/:id", paymentHandler.DeletePayment)

	// quota routes
	router.PUT("/quotas/:id", quotaHandler.UpdateQuota)

	fmt.Println("🚀 Starting server on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
