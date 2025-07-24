package main

import (
	"log"
	"os"

	"go-test/internal/api/handlers"
	"go-test/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	dataPath := os.Getenv("DATA_PATH")
	if dataPath == "" {
		dataPath = "../.."
	}

	if err := handlers.SetupProducts(dataPath); err != nil {
		log.Fatalf("Error cargando productos: %v", err)
	}

	r := gin.Default()

	r.Use(middleware.CORS())
	r.Use(middleware.Cache())
	r.GET("/search", handlers.SearchHandler)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Error iniciando servidor: %v", err)
	}
}
