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

type CategoryNode struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type VtexProduct struct {
	ProductName  string         `json:"productName"`
	LinkText     string         `json:"linkText"`
	Link         string         `json:"link"`
	ProductId    string         `json:"productId"`
	Brand        string         `json:"brand"`
	BrandId      int            `json:"brandId"`
	CategoryId   string         `json:"categoryId"`
	CategoryTree []CategoryNode `json:"categoryTree"`
	Categories   []string       `json:"categories"`
	Items        []struct {
		Images []struct {
			ImageUrl string `json:"imageUrl"`
		} `json:"images"`
		Sellers []struct {
			CommertialOffer struct {
				Price float64 `json:"Price"`
			} `json:"commertialOffer"`
		} `json:"sellers"`
	} `json:"items"`
	Properties []struct {
		Name   string   `json:"name"`
		Values []string `json:"values"`
	} `json:"properties"`
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
	dateStr := output.Date
	dailyDir := filepath.Join("..", "data", "daily", dateStr)
	if err := os.MkdirAll(dailyDir, 0755); err != nil {
		return fmt.Errorf("error creating daily directory: %v", err)
	}

	dailyFile := filepath.Join(dailyDir, "jumbo-ofertas.json")
	dailyData, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling JSON: %v", err)
	}
	if err := os.WriteFile(dailyFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing daily file: %v", err)
	}

	currentFile := filepath.Join("..", "data", "jumbo-ofertas.json")
	if err := os.WriteFile(currentFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing current file: %v", err)
	}

	return nil
}

func extractCategory(categoryTree []CategoryNode, categories []string) string {
	if len(categoryTree) > 0 {
		return categoryTree[len(categoryTree)-1].Name
	}
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
	clusterId := "50532"
	baseUrl := "https://www.jumbo.com.ar/api/catalog_system/pub/products/search?productClusterIds=" + clusterId
	pageSize := 50
	from := 0
	allProducts := []EnrichedProduct{}
	now := time.Now()
	scrapedAt := now.Format(time.RFC3339)

	maxFrom := 2500
	for from < maxFrom {
		log.Printf("📄 Obteniendo productos %d-%d...", from, from+pageSize-1)
		url := fmt.Sprintf("%s&_from=%d&_to=%d", baseUrl, from, from+pageSize-1)
		client := &http.Client{
			Timeout: 30 * time.Second,
		}
		var resp *http.Response
		var body []byte
		maxRetries := 3
		for retry := 0; retry < maxRetries; retry++ {
			if retry > 0 {
				log.Printf("Reintento %d de %d...", retry+1, maxRetries)
				time.Sleep(2 * time.Second)
			}

			req, err := http.NewRequest("GET", url, nil)
			if err != nil {
				log.Printf("Error creando request: %v", err)
				continue
			}

			req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
			req.Header.Set("Accept", "application/json")
			req.Header.Set("Connection", "keep-alive")
			req.Header.Set("Cache-Control", "no-cache")

			resp, err = client.Do(req)
			if err != nil {
				log.Printf("Error en request (intento %d): %v", retry+1, err)
				continue
			}

			body, err = io.ReadAll(resp.Body)
			resp.Body.Close()
			if err != nil {
				log.Printf("Error leyendo respuesta (intento %d): %v", retry+1, err)
				continue
			}

			if resp.StatusCode == 200 || resp.StatusCode == 206 {
				break
			}
			log.Printf("Status code %d en intento %d", resp.StatusCode, retry+1)
		}

		if resp == nil || (resp.StatusCode != 200 && resp.StatusCode != 206) {
			log.Printf("❌ No se pudo obtener respuesta después de %d intentos", maxRetries)
			break
		}

		var vtexProducts []VtexProduct
		if err := json.Unmarshal(body, &vtexProducts); err != nil {
			log.Printf("Error parseando JSON: %v", err)
			continue
		}
		if len(vtexProducts) == 0 {
			log.Printf("✅ No hay más productos")
			break
		}

		log.Printf("✅ Encontrados %d productos", len(vtexProducts))
		for _, vp := range vtexProducts {
			price := 0.0
			if len(vp.Items) > 0 && len(vp.Items[0].Sellers) > 0 {
				price = vp.Items[0].Sellers[0].CommertialOffer.Price
			}

			if price <= 0 || price > 999999 {
				log.Printf("⚠️ Precio inválido: %s (%.2f)", vp.ProductName, price)
				continue
			}

			image := ""
			if len(vp.Items) > 0 && len(vp.Items[0].Images) > 0 {
				image = vp.Items[0].Images[0].ImageUrl
			}

			link := vp.Link
			if link == "" {
				link = "https://www.jumbo.com.ar/" + vp.LinkText + "/p"
			}

			category := extractCategory(vp.CategoryTree, vp.Categories)

			product := EnrichedProduct{
				Name:        vp.ProductName,
				Price:       price,
				Link:        link,
				Image:       image,
				Brand:       vp.Brand,
				ProductId:   vp.ProductId,
				CategoryId:  vp.CategoryId,
				Category:    category,
				Description: "",
				ScrapedAt:   scrapedAt,
			}

			allProducts = append(allProducts, product)
		}
		from += pageSize
	}

	dateString := now.Format("2006-01-02")
	timeString := now.Format("15-04-05")

	output := Output{
		Timestamp:     now.Format(time.RFC3339),
		Date:          dateString,
		Time:          timeString,
		Store:         "Jumbo",
		TotalProducts: len(allProducts),
		LastUpdate:    now.Format(time.RFC3339),
		Data:          allProducts,
	}

	if err := saveHistoricalData(output); err != nil {
		log.Printf("Error saving historical data: %v", err)
	}

	fmt.Printf("✅ Scraping Jumbo completado. Productos: %d\n", len(allProducts))
}
