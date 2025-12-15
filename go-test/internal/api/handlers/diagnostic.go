package handlers

import (
	"fmt"
	"go-test/internal/models"
	"sort"

	"github.com/gin-gonic/gin"
)

func DataQualityHandler(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()

	analysis := analyzeDataQuality()
	c.JSON(200, analysis)
}

func SampleProductsHandler(c *gin.Context) {
	store := c.Param("store")
	var limit int
	if _, err := fmt.Sscanf(c.Param("limit"), "%d", &limit); err != nil || limit <= 0 {
		limit = 5
	}

	mu.RLock()
	defer mu.RUnlock()

	var samples []models.Product
	count := 0
	for _, p := range allProducts {
		if p.Store == store && count < limit {
			samples = append(samples, p)
			count++
		}
	}

	c.JSON(200, gin.H{
		"store":    store,
		"limit":    limit,
		"count":    len(samples),
		"products": samples,
	})
}

func StoresInfoHandler(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()

	stores := make(map[string]interface{})
	storeNames := map[string]bool{}

	for _, p := range allProducts {
		if !storeNames[p.Store] {
			storeNames[p.Store] = true
		}
	}

	for store := range storeNames {
		count := 0
		var prices []float64
		var categories []string
		categoryMap := make(map[string]bool)

		for _, p := range allProducts {
			if p.Store == store {
				count++
				prices = append(prices, p.Price)
				if p.Category != "" && !categoryMap[p.Category] {
					categories = append(categories, p.Category)
					categoryMap[p.Category] = true
				}
			}
		}

		minPrice := 999999.0
		maxPrice := 0.0
		totalPrice := 0.0
		priceCount := 0

		for _, price := range prices {
			if price > 0 {
				if price < minPrice {
					minPrice = price
				}
				if price > maxPrice {
					maxPrice = price
				}
				totalPrice += price
				priceCount++
			}
		}

		if priceCount == 0 {
			minPrice = 0
		}

		avgPrice := 0.0
		if priceCount > 0 {
			avgPrice = totalPrice / float64(priceCount)
		}

		sort.Strings(categories)

		stores[store] = gin.H{
			"totalProducts":   count,
			"minPrice":        minPrice,
			"maxPrice":        maxPrice,
			"avgPrice":        avgPrice,
			"categoriesCount": len(categories),
			"categories":      categories,
		}
	}

	c.JSON(200, stores)
}

func CategoryDistributionHandler(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()

	distribution := make(map[string]map[string]int)

	for _, p := range allProducts {
		if distribution[p.Category] == nil {
			distribution[p.Category] = make(map[string]int)
		}
		distribution[p.Category][p.Store]++
	}

	result := make([]gin.H, 0)
	for category, stores := range distribution {
		result = append(result, gin.H{
			"category": category,
			"stores":   stores,
			"total":    sumStoreValues(stores),
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i]["total"].(int) > result[j]["total"].(int)
	})

	c.JSON(200, result)
}

func sumStoreValues(stores map[string]int) int {
	total := 0
	for _, v := range stores {
		total += v
	}
	return total
}

func analyzeDataQuality() map[string]interface{} {
	totalProducts := len(allProducts)

	missingData := map[string]int{
		"noName":       0,
		"noPrice":      0,
		"noLink":       0,
		"noImage":      0,
		"noCategory":   0,
		"noBrand":      0,
		"priceZero":    0,
		"invalidPrice": 0,
	}

	storeBreakdown := make(map[string]int)
	priceStats := make(map[string]interface{})

	var allPrices []float64

	for _, p := range allProducts {
		storeBreakdown[p.Store]++

		if p.Name == "" {
			missingData["noName"]++
		}
		if p.Price == 0 {
			missingData["noPrice"]++
			missingData["priceZero"]++
		}
		if p.Link == "" {
			missingData["noLink"]++
		}
		if p.Image == "" {
			missingData["noImage"]++
		}
		if p.Category == "" || p.Category == "Otros" {
			missingData["noCategory"]++
		}
		if p.Brand == "" {
			missingData["noBrand"]++
		}
		if p.Price > 0 && p.Price < 10 {
			missingData["invalidPrice"]++
		}

		if p.Price > 0 {
			allPrices = append(allPrices, p.Price)
		}
	}

	if len(allPrices) > 0 {
		minPrice := allPrices[0]
		maxPrice := allPrices[0]
		totalPrice := float64(0)

		for _, p := range allPrices {
			if p < minPrice {
				minPrice = p
			}
			if p > maxPrice {
				maxPrice = p
			}
			totalPrice += p
		}

		priceStats = map[string]interface{}{
			"min":   minPrice,
			"max":   maxPrice,
			"avg":   totalPrice / float64(len(allPrices)),
			"count": len(allPrices),
		}
	}

	noCategoryPct := float64(0)
	noBrandPct := float64(0)
	if totalProducts > 0 {
		noCategoryPct = float64(missingData["noCategory"]) * 100 / float64(totalProducts)
		noBrandPct = float64(missingData["noBrand"]) * 100 / float64(totalProducts)
	}

	return map[string]interface{}{
		"totalProducts":  totalProducts,
		"storeBreakdown": storeBreakdown,
		"missingData":    missingData,
		"priceStats":     priceStats,
		"recommendations": []string{
			fmt.Sprintf("Productos sin categoría: %.1f%% (considera mejorar extracción)", noCategoryPct),
			fmt.Sprintf("Productos sin marca: %.1f%% (disponible en APIs)", noBrandPct),
			"Valida precios antes de guardar (descartar <$10 o >$999999)",
			"Considera extraer categoryId de las APIs originales",
			"Implementar deduplicación usando productId",
		},
	}
}
