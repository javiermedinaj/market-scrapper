package handlers

import (
	"sort"

	"github.com/gin-gonic/gin"
)

func AvailableCategoriesHandler(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()

	categoryMap := make(map[string]bool)
	for _, p := range allProducts {
		if p.Category != "" {
			categoryMap[p.Category] = true
		}
	}

	categories := make([]string, 0, len(categoryMap))
	for cat := range categoryMap {
		categories = append(categories, cat)
	}

	sort.Strings(categories)

	c.JSON(200, gin.H{
		"categories": categories,
		"total":      len(categories),
	})
}

func CategoriesStatsHandler(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()

	stats := calculateCategoryStats()
	c.JSON(200, stats)
}

func CategoryDetailHandler(c *gin.Context) {
	categoryName := c.Param("name")

	mu.RLock()
	defer mu.RUnlock()

	products := filterByCategory(allProducts, categoryName)

	c.JSON(200, gin.H{
		"category": categoryName,
		"products": products,
		"stats": gin.H{
			"totalProducts":   len(products),
			"stores":          getStoreBreakdown(products),
			"priceComparison": getPriceComparison(products),
		},
	})
}

func CheapestProductsHandler(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()

	result := make(map[string][]gin.H)
	stats := calculateCategoryStats()

	for category, catStats := range stats {
		var cheapest []gin.H
		products := filterByCategory(allProducts, category)

		for _, p := range products {
			if p.Store == catStats.CheapestStore {
				cheapest = append(cheapest, gin.H{
					"name":     p.Name,
					"price":    p.Price,
					"store":    p.Store,
					"link":     p.Link,
					"image":    p.Image,
					"category": p.Category,
				})
			}
		}

		result[category] = cheapest
	}

	c.JSON(200, result)
}

func StoresComparisonHandler(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()

	supermarkets := []string{"Día", "Jumbo"}
	pharmacies := []string{"Farmacity", "FarmaOnline"}

	supermarketData := make(map[string]interface{})
	for _, store := range supermarkets {
		supermarketData[store] = getStoreStats(store)
	}

	pharmacyData := make(map[string]interface{})
	for _, store := range pharmacies {
		pharmacyData[store] = getStoreStats(store)
	}

	c.JSON(200, gin.H{
		"supermarkets": gin.H{
			"totalProducts": len(filterByStoreType(allProducts, true)),
			"stores":        supermarketData,
		},
		"pharmacies": gin.H{
			"totalProducts": len(filterByStoreType(allProducts, false)),
			"stores":        pharmacyData,
		},
	})
}

func CategoryStoresComparisonHandler(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()

	result := make(map[string]interface{})
	stats := calculateCategoryStats()

	for category := range stats {
		products := filterByCategory(allProducts, category)

		supermarketStats := make(map[string]float64)
		pharmacyStats := make(map[string]float64)

		for _, p := range products {
			if isSupermarket(p.Store) {
				if _, exists := supermarketStats[p.Store]; !exists {
					supermarketStats[p.Store] = 0
				}
				supermarketStats[p.Store] += p.Price
			} else {
				if _, exists := pharmacyStats[p.Store]; !exists {
					pharmacyStats[p.Store] = 0
				}
				pharmacyStats[p.Store] += p.Price
			}
		}

		storeComparison := make(map[string]float64)
		for store, total := range supermarketStats {
			count := 0
			for _, p := range products {
				if p.Store == store {
					count++
				}
			}
			if count > 0 {
				storeComparison[store] = total / float64(count)
			}
		}
		for store, total := range pharmacyStats {
			count := 0
			for _, p := range products {
				if p.Store == store {
					count++
				}
			}
			if count > 0 {
				storeComparison[store] = total / float64(count)
			}
		}

		result[category] = storeComparison
	}

	c.JSON(200, result)
}

func CheapestByCategoryHandler(c *gin.Context) {
	category := c.Param("category")

	mu.RLock()
	defer mu.RUnlock()

	products := filterByCategory(allProducts, category)

	type ProductInfo struct {
		Name      string  `json:"name"`
		Price     float64 `json:"price"`
		Store     string  `json:"store"`
		Link      string  `json:"link"`
		Image     string  `json:"image"`
		Brand     string  `json:"brand"`
		ProductId string  `json:"productId"`
		Category  string  `json:"category"`
	}

	var productList []ProductInfo
	for _, p := range products {
		productList = append(productList, ProductInfo{
			Name:      p.Name,
			Price:     p.Price,
			Store:     p.Store,
			Link:      p.Link,
			Image:     p.Image,
			Brand:     p.Brand,
			ProductId: p.ProductId,
			Category:  p.Category,
		})
	}

	sort.Slice(productList, func(i, j int) bool {
		return productList[i].Price < productList[j].Price
	})

	limit := 10
	if len(productList) < limit {
		limit = len(productList)
	}

	c.JSON(200, gin.H{
		"category": category,
		"total":    len(productList),
		"cheapest": productList[:limit],
	})
}
