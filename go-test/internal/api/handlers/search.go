package handlers

import (
	"fmt"
	"go-test/internal/models"
	"go-test/internal/services"
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

var allProducts []models.Product

func SetupProducts(baseDir string) error {
	dataDir := filepath.Join(baseDir, "data")
	log.Printf("📂 Carpeta de datos: %s", dataDir)
	log.Printf("📂 Carpeta de datos: %s", dataDir)

	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		return fmt.Errorf("❌ la carpeta de datos no existe: %s", dataDir)
	}

	diaProducts, err := services.LoadProducts(dataDir, "dia-ofertas.json", "Día")
	if err != nil {
		log.Printf("❌ Error cargando productos Día: %v", err)
		return err
	}
	log.Printf("✅ Cargados %d productos de Día", len(diaProducts))

	jumboProducts, err := services.LoadProducts(dataDir, "jumbo-ofertas.json", "Jumbo")
	if err != nil {
		log.Printf("❌ Error cargando productos Jumbo: %v", err)
		return err
	}
	log.Printf("✅ Cargados %d productos de Jumbo", len(jumboProducts))

	// Productos de Farmacity
	farmacityProducts, err := services.LoadProducts(dataDir, "farmacity-ofertas.json", "Farmacity")
	if err != nil {
		log.Printf("❌ Error cargando productos Farmacity: %v", err)
		return err
	}
	log.Printf("✅ Cargados %d productos de Farmacity", len(farmacityProducts))

	// Productos de FarmaOnline
	farmaOnlineProducts, err := services.LoadProducts(dataDir, "farma-ofertas.json", "FarmaOnline")
	if err != nil {
		log.Printf("❌ Error cargando productos FarmaOnline: %v", err)
		return err
	}
	log.Printf("✅ Cargados %d productos de FarmaOnline", len(farmaOnlineProducts))

	totalSize := len(diaProducts) + len(jumboProducts) + len(farmacityProducts) + len(farmaOnlineProducts)
	allProducts = make([]models.Product, 0, totalSize)

	allProducts = append(allProducts, diaProducts...)
	allProducts = append(allProducts, jumboProducts...)
	allProducts = append(allProducts, farmacityProducts...)
	allProducts = append(allProducts, farmaOnlineProducts...)

	log.Printf("✅ Total productos cargados: %d", len(allProducts))
	return nil
}

func SearchHandler(c *gin.Context) {
	query := c.Query("q")
	results := services.SearchProducts(allProducts, query)
	c.JSON(200, gin.H{
		"query": query,
		"count": len(results),
		"data":  results,
	})
}
