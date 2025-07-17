package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type Product struct {
	Name  string `json:"name"`
	Price string `json:"price"`
	Link  string `json:"link"`
	Image string `json:"image"`
}

type DiaItem struct {
	ProductName string `json:"productName"`
	Link        string `json:"link"`
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
	// Crear estructura de carpetas para el día actual
	now := time.Now()
	dateStr := now.Format("2006-01-02")
	dailyDir := filepath.Join("..", "data", "daily", dateStr)
	if err := os.MkdirAll(dailyDir, 0755); err != nil {
		return fmt.Errorf("error creating daily directory: %v", err)
	}

	// Guardar en la carpeta del día
	dailyFile := filepath.Join(dailyDir, fmt.Sprintf("%s-ofertas.json", storeName))
	dailyData, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling JSON: %v", err)
	}
	if err := ioutil.WriteFile(dailyFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing daily file: %v", err)
	}

	// Actualizar también el archivo actual
	currentFile := filepath.Join("..", "data", fmt.Sprintf("%s-ofertas.json", storeName))
	if err := ioutil.WriteFile(currentFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing current file: %v", err)
	}

	return nil
}

func main() {
	pageSize := 50
	from := 0
	allProducts := []Product{}

	for {
		to := from + pageSize - 1
		// url https://diaonline.supermercadosdia.com.ar/api/catalog_system/pub/products/search?productClusterIds=567&_from=4600_to=4649
		url := fmt.Sprintf("https://diaonline.supermercadosdia.com.ar/api/catalog_system/pub/products/search?productClusterIds=567&_from=%d&_to=%d", from, to)
		log.Printf("➡️ Requesting %d–%d (url=%s)", from, to, url)

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

		body, err := ioutil.ReadAll(resp.Body)
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
			log.Printf("Error parseando JSON: %v, body: %s", err, string(body))
			break
		}

		count := len(diaItems)
		log.Printf("✅ Página %d–%d: %d productos", from, to, count)
		if count == 0 {
			break
		}

		for _, item := range diaItems {
			product := Product{
				Name:  item.ProductName,
				Link:  item.Link,
				Price: "",
				Image: "",
			}
			if len(item.Items) > 0 {
				if len(item.Items[0].Images) > 0 {
					product.Image = item.Items[0].Images[0].ImageUrl
				}
				if len(item.Items[0].Sellers) > 0 {
					product.Price = fmt.Sprintf("%.2f", item.Items[0].Sellers[0].CommertialOffer.Price)
				}
			}
			allProducts = append(allProducts, product)
		}
		from += pageSize
	}

	now := time.Now()
	result := map[string]interface{}{
		"timestamp":     now.Format(time.RFC3339),
		"date":          now.Format("2006-01-02"),
		"time":          now.Format("15-04-05"),
		"store":         "dia",
		"totalProducts": len(allProducts),
		"lastUpdate":    now.Format(time.RFC3339),
		"data":          allProducts,
	}

	// Guardar solo en la estructura de datos históricos
	if err := saveHistoricalData(result, "dia"); err != nil {
		log.Printf("Error saving historical data: %v", err)
	}

	fmt.Printf("✅ Scrapeo finalizado. Productos: %d\n", len(allProducts))
}
