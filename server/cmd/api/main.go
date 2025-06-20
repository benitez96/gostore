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
)

func main() {

	dbConnection, err := db.Connect()
	if err != nil {
		log.Fatal("No se pudo conectar a la base de datos:", err)
	}
	defer dbConnection.Close()

	saleRepository := saleRepository.Repository{
		Queries: sqlc.New(dbConnection),
		DB:      dbConnection,
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
	saleSvc := saleSvc.Service{
		Sr:  &saleRepository,
		Spr: &saleProductRepository,
		Qr:  &quotaRepository,
		Pr:  &paymentRepository,
	}

	paymentSvc := paymentSvc.Service{
		Repo:      &paymentRepository,
		QuotaRepo: &quotaRepository,
		SaleRepo:  &saleRepository,
	}

	quotaSvc := quotaSvc.Service{
		Repo: &quotaRepository,
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

	clientRepository := clientRepository.Repository{
		Queries: sqlc.New(dbConnection),
	}
	clientSvc := clientSvc.Service{
		Repo:    &clientRepository,
		SaleSvc: &saleSvc,
	}
	clientHandler := clientHandler.Handler{
		Service: &clientSvc,
	}

	router := httprouter.New()

	// client routes
	router.POST("/clients", clientHandler.CreateClient)
	router.GET("/clients", clientHandler.GetAllClients)
	router.GET("/clients/:id", clientHandler.GetClientByID)

	// sale routes
	router.POST("/sales", saleHandler.CreateSale)
	router.GET("/sales/:id", saleHandler.GetByID)

	// payment routes
	router.POST("/payments", paymentHandler.CreatePayment)

	// quota routes
	router.PUT("/quotas/:id", quotaHandler.UpdateQuota)

	fmt.Println("🚀 Starting server on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
