package main

import (
	"log"

	"go-test/internal/api/handlers"
	"go-test/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Inicializar productos
	if err := handlers.SetupProducts("."); err != nil {
		log.Fatalf("Error cargando productos: %v", err)
	}

	// Configurar Gin
	r := gin.Default()

	// Middlewares globales
	r.Use(middleware.CORS())
	r.Use(middleware.Cache())

	// Rutas
	r.GET("/search", handlers.SearchHandler)

	// Iniciar servidor
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Error iniciando servidor: %v", err)
	}
}
