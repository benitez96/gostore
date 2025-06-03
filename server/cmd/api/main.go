package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"

	"github.com/benitez96/gostore/internal/repositories/db"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"

	clientHandler "github.com/benitez96/gostore/cmd/api/handlers/client"
	clientRepository "github.com/benitez96/gostore/internal/repositories/client"
	clientSvc "github.com/benitez96/gostore/internal/services/client"
	saleHandler "github.com/benitez96/gostore/cmd/api/handlers/sale"
	saleRepository "github.com/benitez96/gostore/internal/repositories/sale"
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
		DB: 		dbConnection,
	}
	saleSvc := saleSvc.Service{
		Repo: &saleRepository,
	}

	saleHandler := saleHandler.Handler{
		Service: &saleSvc,
	}

	clientRepository := clientRepository.Repository{
		Queries: sqlc.New(dbConnection),
	}
	clientSvc := clientSvc.Service{
		Repo: &clientRepository,
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

	fmt.Println("🚀 Starting server on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
