package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
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

func main() {
	clusterId := "50532"
	baseUrl := "https://www.jumbo.com.ar/api/catalog_system/pub/products/search?productClusterIds=" + clusterId
	pageSize := 50
	from := 0
	allProducts := []Product{}

	maxFrom := 2500
	for from < maxFrom {
		url := fmt.Sprintf("%s&_from=%d&_to=%d", baseUrl, from, from+pageSize-1)
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Fatalf("Error creando request: %v", err)
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")
		req.Header.Set("Accept", "application/json")
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Fatalf("Error al hacer request: %v", err)
		}
		body, err := ioutil.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.Fatalf("Error leyendo respuesta: %v", err)
		}

		var vtexProducts []map[string]interface{}
		err = json.Unmarshal(body, &vtexProducts)
		if err != nil {
			fmt.Println("Respuesta recibida (no es JSON de productos):")
			fmt.Println(string(body))
			log.Fatalf("Error parseando JSON: %v", err)
		}
		if len(vtexProducts) == 0 {
			break // No hay más productos
		}

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

	outFile := "jumbo-ofertas-test.json"
	f, err := os.Create(outFile)
	if err != nil {
		log.Fatalf("No se pudo crear el archivo de salida: %v", err)
	}
	defer f.Close()

	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	if err := enc.Encode(output); err != nil {
		log.Fatalf("No se pudo escribir el JSON: %v", err)
	}

	fmt.Printf("✅ Scraping Jumbo (Go, API) completado. Productos: %d\nArchivo: %s\n", len(allProducts), outFile)
}
