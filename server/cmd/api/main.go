package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"

	clientHandler "github.com/benitez96/gostore/cmd/api/handlers/client"
	clientRepository "github.com/benitez96/gostore/internal/repositories/client"
	"github.com/benitez96/gostore/internal/repositories/db"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	clientSvc "github.com/benitez96/gostore/internal/services/client"
)

func main() {

	dbConnection, err := db.Connect()
	if err != nil {
		log.Fatal("No se pudo conectar a la base de datos:", err)
	}
	defer dbConnection.Close()

	clientRepository := clientRepository.Repository{
		Queries: sqlc.New(dbConnection),
	}
	clientSvc := clientSvc.Service{
		Repo: &clientRepository,
	}
	clientHandler := clientHandler.Handler{
		Service: &clientSvc,
	}

	router := httprouter.New()

	// client routes
	router.POST("/clients", clientHandler.CreateClient)
	router.GET("/clients", clientHandler.GetAllClients)

	fmt.Println("🚀 Starting server on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
