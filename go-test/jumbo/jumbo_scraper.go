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

type VtexProduct struct {
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
	ClusterHighlights map[string]interface{} `json:"clusterHighlights"`
	Link              string                 `json:"link"`
	Brand             string                 `json:"brand"`
	BrandId           int                    `json:"brandId"`
	CategoryId        string                 `json:"categoryId"`
	CategoryTree      []struct {
		Id   string `json:"id"`
		Name string `json:"name"`
	} `json:"categoryTree"`
	Properties []struct {
		Name   string   `json:"name"`
		Values []string `json:"values"`
	} `json:"properties"`
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
	// Crear estructura de carpetas para el día actual
	dateStr := output.Date
	dailyDir := filepath.Join("..", "data", "daily", dateStr)
	if err := os.MkdirAll(dailyDir, 0755); err != nil {
		return fmt.Errorf("error creating daily directory: %v", err)
	}

	// Guardar en la carpeta del día
	dailyFile := filepath.Join(dailyDir, "jumbo-ofertas.json")
	dailyData, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling JSON: %v", err)
	}
	if err := ioutil.WriteFile(dailyFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing daily file: %v", err)
	}

	// Actualizar también el archivo actual
	currentFile := filepath.Join("..", "data", "jumbo-ofertas.json")
	if err := ioutil.WriteFile(currentFile, dailyData, 0644); err != nil {
		return fmt.Errorf("error writing current file: %v", err)
	}

	return nil
}

func main() {
	clusterId := "50532"
	baseUrl := "https://www.jumbo.com.ar/api/catalog_system/pub/products/search?productClusterIds=" + clusterId
	pageSize := 50
	from := 0
	allProducts := []Product{}

	maxFrom := 2500
	for from < maxFrom {
		log.Printf("📄 Obteniendo productos %d-%d...", from, from+pageSize-1)
		url := fmt.Sprintf("%s&_from=%d&_to=%d", baseUrl, from, from+pageSize-1)
		// Configurar cliente HTTP con timeout y reintentos
		client := &http.Client{
			Timeout: 30 * time.Second,
		}

		// Intentar hasta 3 veces
		var resp *http.Response
		var body []byte
		maxRetries := 3
		for retry := 0; retry < maxRetries; retry++ {
			if retry > 0 {
				log.Printf("Reintento %d de %d...", retry+1, maxRetries)
				time.Sleep(2 * time.Second) // Esperar entre reintentos
			}

			req, err := http.NewRequest("GET", url, nil)
			if err != nil {
				log.Printf("Error creando request: %v", err)
				continue
			}

			req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
			req.Header.Set("Accept", "application/json")
			req.Header.Set("Connection", "keep-alive")
			req.Header.Set("Cache-Control", "no-cache")

			resp, err = client.Do(req)
			if err != nil {
				log.Printf("Error en request (intento %d): %v", retry+1, err)
				continue
			}

			body, err = ioutil.ReadAll(resp.Body)
			resp.Body.Close()
			if err != nil {
				log.Printf("Error leyendo respuesta (intento %d): %v", retry+1, err)
				continue
			}

			// Aceptar tanto 200 (OK) como 206 (Partial Content)
			if resp.StatusCode == 200 || resp.StatusCode == 206 {
				break // Si la respuesta es exitosa, salir del loop
			}
			log.Printf("Status code %d en intento %d (esperado 200 o 206)", resp.StatusCode, retry+1)
		}

		if resp == nil || (resp.StatusCode != 200 && resp.StatusCode != 206) {
			log.Printf("❌ No se pudo obtener respuesta después de %d intentos", maxRetries)
			break
		}

		var vtexProducts []map[string]interface{}
		if err := json.Unmarshal(body, &vtexProducts); err != nil {
			log.Printf("Respuesta recibida (no es JSON de productos):\n%s", string(body))
			log.Printf("Error parseando JSON: %v", err)
			continue // Intentar siguiente página
		}
		if len(vtexProducts) == 0 {
			log.Printf("✅ No hay más productos en esta página")
			break
		}

		log.Printf("✅ Encontrados %d productos en esta página", len(vtexProducts))
		for _, vp := range vtexProducts {
			name, _ := vp["productName"].(string)
			linkText, _ := vp["linkText"].(string)
			link := "https://www.jumbo.com.ar/" + linkText + "/p"
			image := ""
			if items, ok := vp["items"].([]interface{}); ok && len(items) > 0 {
				item := items[0].(map[string]interface{})
				if images, ok := item["images"].([]interface{}); ok && len(images) > 0 {
					img := images[0].(map[string]interface{})
					image, _ = img["imageUrl"].(string)
				}
			}
			price := ""
			if items, ok := vp["items"].([]interface{}); ok && len(items) > 0 {
				item := items[0].(map[string]interface{})
				if sellers, ok := item["sellers"].([]interface{}); ok && len(sellers) > 0 {
					seller := sellers[0].(map[string]interface{})
					if comm, ok := seller["commertialOffer"].(map[string]interface{}); ok {
						if p, ok := comm["Price"].(float64); ok {
							price = fmt.Sprintf("%.2f", p)
						}
					}
				}
			}
			allProducts = append(allProducts, Product{
				Name:  name,
				Price: price,
				Link:  link,
				Image: image,
			})
		}
		from += pageSize
	}

	now := time.Now()
	dateString := now.Format("2006-01-02")
	timeString := now.Format("15-04-05")

	output := Output{
		Timestamp:     now.Format(time.RFC3339),
		Date:          dateString,
		Time:          timeString,
		Store:         "jumbo",
		TotalProducts: len(allProducts),
		LastUpdate:    now.Format(time.RFC3339),
		Data:          allProducts,
	}

	// Guardar solo en la estructura de datos históricos
	if err := saveHistoricalData(output); err != nil {
		log.Printf("Error saving historical data: %v", err)
	}

	fmt.Printf("✅ Scraping Jumbo (Go, API) completado. Productos: %d\n", len(allProducts))
}
