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

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"name":          "Market Scrapper API",
			"version":       "1.0.0",
			"description":   "API para búsqueda y comparación de precios",
			"totalProducts": handlers.GetTotalProducts(),
			"endpoints": gin.H{
				"search": "/search?q={query}&store={store}&limit={limit}",
				"health": "/health",
				"stores": "/stores",
			},
			"examples": []string{
				"/search?q=leche",
				"/search?q=aspirina&store=farmacity",
				"/search?q=coca cola&limit=10",
			},
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":        "healthy",
			"message":       "Market Scrapper API is running",
			"totalProducts": handlers.GetTotalProducts(), // Necesitarás agregar esta función
			"version":       "1.0.0",
		})
	})

	r.GET("/stores", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"stores": []gin.H{
				{"name": "dia", "displayName": "Supermercado Día", "type": "supermarket"},
				{"name": "jumbo", "displayName": "Jumbo", "type": "supermarket"},
				{"name": "farmacity", "displayName": "Farmacity", "type": "pharmacy"},
				{"name": "farmaonline", "displayName": "FarmaOnline", "type": "pharmacy"},
			},
		})
	})

	r.GET("/search", handlers.SearchHandler)

	// 🆕 Analytics endpoints
	r.GET("/api/analytics/available-categories", handlers.AvailableCategoriesHandler)
	r.GET("/api/analytics/categories", handlers.CategoriesStatsHandler)
	r.GET("/api/analytics/category/:name", handlers.CategoryDetailHandler)
	r.GET("/api/analytics/cheapest", handlers.CheapestProductsHandler)
	r.GET("/api/analytics/stores-comparison", handlers.StoresComparisonHandler)
	r.GET("/api/analytics/category-stores-comparison", handlers.CategoryStoresComparisonHandler)
	r.GET("/api/analytics/cheapest-by-category/:category", handlers.CheapestByCategoryHandler)

	// 🆕 Diagnostic endpoints
	r.GET("/api/diagnostic/data-quality", handlers.DataQualityHandler)
	r.GET("/api/diagnostic/sample/:store/:limit", handlers.SampleProductsHandler)
	r.GET("/api/diagnostic/stores", handlers.StoresInfoHandler)
	r.GET("/api/diagnostic/category-distribution", handlers.CategoryDistributionHandler)

	log.Printf("🚀 Market Scrapper API iniciada en http://localhost:8081")
	if err := r.Run(":8081"); err != nil {
		log.Fatalf("Error iniciando servidor: %v", err)
	}
}
