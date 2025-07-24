package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type Product struct {
	Name     string `json:"name"`
	Price    string `json:"price"`
	Link     string `json:"link"`
	Image    string `json:"image"`
	Promo    string `json:"promo,omitempty"`
	Category string `json:"category,omitempty"`
}

type FarmaOnlineProduct struct {
	ProductName string `json:"productName"`
	LinkText    string `json:"linkText"`
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
	Timestamp     string    `json:"timestamp"`
	Date          string    `json:"date"`
	Time          string    `json:"time"`
	Store         string    `json:"store"`
	TotalProducts int       `json:"totalProducts"`
	LastUpdate    string    `json:"lastUpdate"`
	Data          []Product `json:"data"`
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

func main() {
	baseURL := "https://www.farmaonline.com/api/catalog_system/pub/products/search"
	pageSize := 50
	maxProducts := 2500 // Límite común en APIs VTEX
	allProducts := []Product{}

	for from := 0; from < maxProducts; from += pageSize {
		to := from + pageSize - 1
		if to >= maxProducts {
			to = maxProducts - 1
		}

		log.Printf("📄 Obteniendo productos %d-%d...", from, to)
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
			if len(fp.Items) > 0 && len(fp.Items[0].Sellers) > 0 {
				var imageURL string
				if len(fp.Items[0].Images) > 0 {
					imageURL = fp.Items[0].Images[0].ImageUrl
				}

				price := fmt.Sprintf("%.2f", fp.Items[0].Sellers[0].CommertialOffer.Price)
				link := "https://www.farmaonline.com/" + fp.LinkText + "/p"

				allProducts = append(allProducts, Product{
					Name:  fp.ProductName,
					Price: price,
					Link:  link,
					Image: imageURL,
				})
			}
		}

		log.Printf("✅ Página procesada. Productos acumulados: %d", len(allProducts))
		time.Sleep(time.Millisecond * 500)
	}

	output := Output{
		Timestamp:     time.Now().Format(time.RFC3339),
		Date:          time.Now().Format("2006-01-02"),
		Time:          time.Now().Format("15:04:05"),
		Store:         "Farmaonline",
		TotalProducts: len(allProducts),
		LastUpdate:    time.Now().Format(time.RFC3339),
		Data:          allProducts,
	}

	if err := saveHistoricalData(output); err != nil {
		log.Fatalf("Error guardando datos: %v", err)
	}

	fmt.Printf("✅ Scraping de Farmaonline completado. Total productos: %d\n", len(allProducts))
}
