package main

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// EnrichedProduct contiene toda la data extraída
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

type FarmaOnlineProduct struct {
	ProductName string   `json:"productName"`
	LinkText    string   `json:"linkText"`
	ProductId   string   `json:"productId"`
	Brand       string   `json:"brand"`
	BrandId     int      `json:"brandId"`
	CategoryId  string   `json:"categoryId"`
	Categories  []string `json:"categories"`
	Link        string   `json:"link"`
	Description string   `json:"description"`
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

type Output struct {
	Timestamp     string            `json:"timestamp"`
	Date          string            `json:"date"`
	Time          string            `json:"time"`
	Store         string            `json:"store"`
	TotalProducts int               `json:"totalProducts"`
	LastUpdate    string            `json:"lastUpdate"`
	Data          []EnrichedProduct `json:"data"`
}

func saveHistoricalData(output Output) error {
	now := time.Now()
	dateStr := now.Format("2006-01-02")
	dailyDir := filepath.Join("..", "data", "daily", dateStr)
	if err := os.MkdirAll(dailyDir, 0755); err != nil {
		return fmt.Errorf("error creating daily directory: %v", err)
	}

	dailyFile := filepath.Join(dailyDir, "farmaonline-ofertas.json")
	dailyData, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling JSON: %v", err)
	}
	if err := os.WriteFile(dailyFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing daily file: %v", err)
	}

	currentFile := filepath.Join("..", "data", "farma-ofertas.json")
	if err := os.WriteFile(currentFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing current file: %v", err)
	}

	return nil
}

// stripHTML elimina etiquetas HTML de un string
func stripHTML(text string) string {
	// Decodificar entidades HTML
	text = html.UnescapeString(text)
	// Remover etiquetas HTML
	re := regexp.MustCompile(`<[^>]+>`)
	text = re.ReplaceAllString(text, "")
	// Remover espacios múltiples
	text = strings.TrimSpace(text)
	return text
}

// extractCategory extrae la categoría más específica
func extractCategory(categories []string) string {
	if len(categories) > 0 {
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
	baseURL := "https://www.farmaonline.com/api/catalog_system/pub/products/search"
	pageSize := 50
	maxProducts := 2500
	allProducts := []EnrichedProduct{}
	now := time.Now()
	scrapedAt := now.Format(time.RFC3339)

	for from := 0; from < maxProducts; from += pageSize {
		log.Printf("📄 Obteniendo productos %d-%d...", from, from+pageSize-1)
		to := from + pageSize - 1
		if to >= maxProducts {
			to = maxProducts - 1
		}

		url := fmt.Sprintf("%s?_from=%d&_to=%d", baseURL, from, to)

		client := &http.Client{
			Timeout: time.Second * 30,
		}

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Printf("Error creando request: %v", err)
			continue
		}

		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Error haciendo request: %v", err)
			continue
		}

		var pageProducts []FarmaOnlineProduct
		if err := json.NewDecoder(resp.Body).Decode(&pageProducts); err != nil {
			log.Printf("Error decodificando JSON: %v", err)
			resp.Body.Close()
			break
		}
		resp.Body.Close()

		if len(pageProducts) == 0 {
			break
		}

		for _, fp := range pageProducts {
			if len(fp.Items) == 0 || len(fp.Items[0].Sellers) == 0 {
				continue
			}

			// Validar precio
			price := fp.Items[0].Sellers[0].CommertialOffer.Price
			if price <= 0 || price > 999999 {
				log.Printf("⚠️ Precio inválido: %s (%.2f)", fp.ProductName, price)
				continue
			}

			image := ""
			if len(fp.Items[0].Images) > 0 {
				image = fp.Items[0].Images[0].ImageUrl
			}

			link := fp.Link
			if link == "" {
				link = "https://www.farmaonline.com/" + fp.LinkText + "/p"
			}

			category := extractCategory(fp.Categories)
			description := stripHTML(fp.Description)

			product := EnrichedProduct{
				Name:        fp.ProductName,
				Price:       price,
				Link:        link,
				Image:       image,
				Brand:       fp.Brand,
				ProductId:   fp.ProductId,
				CategoryId:  fp.CategoryId,
				Category:    category,
				Description: description,
				ScrapedAt:   scrapedAt,
			}

			allProducts = append(allProducts, product)
		}

		log.Printf("✅ Página procesada. Productos acumulados: %d", len(allProducts))
		time.Sleep(time.Millisecond * 500)
	}

	output := Output{
		Timestamp:     now.Format(time.RFC3339),
		Date:          now.Format("2006-01-02"),
		Time:          now.Format("15:04:05"),
		Store:         "FarmaOnline",
		TotalProducts: len(allProducts),
		LastUpdate:    now.Format(time.RFC3339),
		Data:          allProducts,
	}

	if err := saveHistoricalData(output); err != nil {
		log.Fatalf("Error guardando datos: %v", err)
	}

	fmt.Printf("✅ Scraping de Farmaonline completado. Total productos: %d\n", len(allProducts))
}
