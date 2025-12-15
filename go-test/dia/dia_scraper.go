package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// EnrichedProduct contiene toda la data extraída del scraper
type EnrichedProduct struct {
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Link        string  `json:"link"`
	Image       string  `json:"image"`
	Brand       string  `json:"brand,omitempty"`
	ProductId   string  `json:"productId,omitempty"`
	CategoryId  string  `json:"categoryId,omitempty"`
	Category    string  `json:"category,omitempty"`
	Description string  `json:"description,omitempty"`
	ScrapedAt   string  `json:"scrapedAt"`
}

type DiaItem struct {
	ProductName string   `json:"productName"`
	Link        string   `json:"link"`
	Brand       string   `json:"brand"`
	BrandId     int      `json:"brandId"`
	ProductId   string   `json:"productId"`
	CategoryId  string   `json:"categoryId"`
	Categories  []string `json:"categories"`
	Items       []struct {
		Images []struct {
			ImageUrl string `json:"imageUrl"`
		} `json:"images"`
		Sellers []struct {
			CommertialOffer struct {
				Price float64 `json:"Price"`
			} `json:"commertialOffer"`
		} `json:"sellers"`
	} `json:"items"`
}

func saveHistoricalData(result map[string]interface{}, storeName string) error {
	now := time.Now()
	dateStr := now.Format("2006-01-02")
	dailyDir := filepath.Join("..", "data", "daily", dateStr)
	if err := os.MkdirAll(dailyDir, 0755); err != nil {
		return fmt.Errorf("error creating daily directory: %v", err)
	}

	dailyFile := filepath.Join(dailyDir, fmt.Sprintf("%s-ofertas.json", storeName))
	dailyData, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling JSON: %v", err)
	}
	if err := os.WriteFile(dailyFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing daily file: %v", err)
	}

	currentFile := filepath.Join("..", "data", fmt.Sprintf("%s-ofertas.json", storeName))
	if err := os.WriteFile(currentFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing current file: %v", err)
	}

	return nil
}

// extractCategory intenta extraer categoría del árbol
func extractCategory(categories []string) string {
	if len(categories) > 0 {
		// Toma la categoría más específica (último nivel)
		parts := strings.Split(categories[len(categories)-1], "/")
		for i := len(parts) - 1; i >= 0; i-- {
			if parts[i] != "" {
				return strings.TrimSpace(parts[i])
			}
		}
	}
	return ""
}

func main() {
	pageSize := 50
	from := 0
	allProducts := []EnrichedProduct{}
	now := time.Now()
	scrapedAt := now.Format(time.RFC3339)

	for {
		to := from + pageSize - 1
		url := fmt.Sprintf("https://diaonline.supermercadosdia.com.ar/api/catalog_system/pub/products/search?productClusterIds=567&_from=%d&_to=%d", from, to)
		log.Printf("➡️ Requesting %d–%d", from, to)

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Fatalf("Error creando request: %v", err)
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")
		req.Header.Set("Accept", "application/json")
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Fatalf("Error al hacer request: %v", err)
		}

		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.Fatalf("Error leyendo body: %v", err)
		}

		if resp.StatusCode != 200 && resp.StatusCode != 206 {
			log.Printf("❌ Status %d — deteniendo paginación", resp.StatusCode)
			break
		}

		var diaItems []DiaItem
		err = json.Unmarshal(body, &diaItems)
		if err != nil {
			log.Printf("Error parseando JSON: %v", err)
			break
		}

		count := len(diaItems)
		log.Printf("✅ Página %d–%d: %d productos", from, to, count)
		if count == 0 {
			break
		}

		for _, item := range diaItems {
			// Validar precio
			price := 0.0
			if len(item.Items) > 0 && len(item.Items[0].Sellers) > 0 {
				price = item.Items[0].Sellers[0].CommertialOffer.Price
			}

			// Descartar precios inválidos
			if price <= 0 || price > 999999 {
				log.Printf("⚠️ Precio inválido descartado: %s (%.2f)", item.ProductName, price)
				continue
			}

			image := ""
			if len(item.Items) > 0 && len(item.Items[0].Images) > 0 {
				image = item.Items[0].Images[0].ImageUrl
			}

			category := extractCategory(item.Categories)

			product := EnrichedProduct{
				Name:        item.ProductName,
				Price:       price,
				Link:        item.Link,
				Image:       image,
				Brand:       item.Brand,
				ProductId:   item.ProductId,
				CategoryId:  item.CategoryId,
				Category:    category,
				Description: "",
				ScrapedAt:   scrapedAt,
			}

			allProducts = append(allProducts, product)
		}
		from += pageSize
	}

	result := map[string]interface{}{
		"timestamp":     now.Format(time.RFC3339),
		"date":          now.Format("2006-01-02"),
		"time":          now.Format("15-04-05"),
		"store":         "Día",
		"totalProducts": len(allProducts),
		"lastUpdate":    now.Format(time.RFC3339),
		"data":          allProducts,
	}

	if err := saveHistoricalData(result, "dia"); err != nil {
		log.Printf("Error saving historical data: %v", err)
	}

	fmt.Printf("✅ Scrapeo finalizado. Productos: %d\n", len(allProducts))
}
