package handlers

import (
	"go-test/internal/models"
)

func isSupermarket(store string) bool {
	return store == "Día" || store == "Jumbo"
}

func filterByCategory(products []models.Product, category string) []models.Product {
	var filtered []models.Product
	for _, p := range products {
		if p.Category == category {
			filtered = append(filtered, p)
		}
	}
	return filtered
}

func filterByStoreType(products []models.Product, isSupermarketType bool) []models.Product {
	var filtered []models.Product
	for _, p := range products {
		if isSupermarket(p.Store) == isSupermarketType {
			filtered = append(filtered, p)
		}
	}
	return filtered
}

func getStoreBreakdown(products []models.Product) map[string]models.StoreStats {
	storeStats := make(map[string]models.StoreStats)

	for _, p := range products {
		if stat, exists := storeStats[p.Store]; exists {
			stat.ProductCount++
			stat.TotalSpent += p.Price

			if p.Price < stat.MinPrice {
				stat.MinPrice = p.Price
			}
			if p.Price > stat.MaxPrice {
				stat.MaxPrice = p.Price
			}

			storeStats[p.Store] = stat
		} else {
			storeStats[p.Store] = models.StoreStats{
				StoreName:    p.Store,
				ProductCount: 1,
				AveragePrice: p.Price,
				MinPrice:     p.Price,
				MaxPrice:     p.Price,
				TotalSpent:   p.Price,
			}
		}
	}

	for store, stat := range storeStats {
		if stat.ProductCount > 0 {
			stat.AveragePrice = stat.TotalSpent / float64(stat.ProductCount)
		}
		storeStats[store] = stat
	}

	return storeStats
}

func getPriceComparison(products []models.Product) map[string]interface{} {
	if len(products) == 0 {
		return map[string]interface{}{
			"avgPrice":      0,
			"minPrice":      0,
			"maxPrice":      0,
			"priceDiff":     0,
			"cheapestStore": "",
		}
	}

	var totalPrice float64
	minPrice := products[0].Price
	maxPrice := products[0].Price
	cheapestStore := products[0].Store

	for _, p := range products {
		totalPrice += p.Price

		if p.Price < minPrice {
			minPrice = p.Price
			cheapestStore = p.Store
		}
		if p.Price > maxPrice {
			maxPrice = p.Price
		}
	}

	avgPrice := totalPrice / float64(len(products))

	return map[string]interface{}{
		"avgPrice":      avgPrice,
		"minPrice":      minPrice,
		"maxPrice":      maxPrice,
		"priceDiff":     maxPrice - minPrice,
		"cheapestStore": cheapestStore,
	}
}

func getStoreStats(storeName string) models.StoreStats {
	var stats models.StoreStats
	stats.StoreName = storeName
	stats.ProductCount = 0
	stats.TotalSpent = 0
	stats.MinPrice = 999999

	count := 0
	for _, p := range allProducts {
		if p.Store == storeName {
			count++
			stats.ProductCount++
			stats.TotalSpent += p.Price

			if p.Price < stats.MinPrice {
				stats.MinPrice = p.Price
			}
			if p.Price > stats.MaxPrice {
				stats.MaxPrice = p.Price
			}
		}
	}

	if count > 0 {
		stats.AveragePrice = stats.TotalSpent / float64(count)
	} else {
		stats.MinPrice = 0
		stats.MaxPrice = 0
	}

	return stats
}

func calculateCategoryStats() map[string]models.CategoryStats {
	stats := make(map[string]models.CategoryStats)

	categoryProducts := make(map[string][]models.Product)
	for _, p := range allProducts {
		categoryProducts[p.Category] = append(categoryProducts[p.Category], p)
	}

	for category, products := range categoryProducts {
		if len(products) == 0 {
			continue
		}

		stores := getStoreBreakdown(products)
		priceComparison := getPriceComparison(products)

		stats[category] = models.CategoryStats{
			Category:      category,
			Stores:        stores,
			CheapestStore: priceComparison["cheapestStore"].(string),
			AveragePrice:  priceComparison["avgPrice"].(float64),
			MinPrice:      priceComparison["minPrice"].(float64),
			MaxPrice:      priceComparison["maxPrice"].(float64),
			PriceDiff:     priceComparison["priceDiff"].(float64),
			ProductCount:  len(products),
		}
	}

	return stats
}
