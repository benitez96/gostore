package db

import (
	"database/sql"
	"log"
	_ "github.com/mattn/go-sqlite3"
)

func Connect() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "../../data/database.db")
	if err != nil {
		log.Fatal("Error al conectar a la base de datos:", err)
		return nil, err
	}
	return db, nil
}
