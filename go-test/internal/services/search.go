package services

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"

	"go-test/internal/models"
)

func normalize(s string) string {
	s = strings.ToLower(s)
	replacer := strings.NewReplacer(
		"á", "a", "é", "e", "í", "i", "ó", "o", "ú", "u",
		"ü", "u", "ñ", "n",
	)
	return replacer.Replace(s)
}

func fuzzyMatch(name, query string) bool {
	name = normalize(name)
	words := strings.Fields(normalize(query))
	for _, w := range words {
		if !strings.Contains(name, w) {
			return false
		}
	}
	return true
}

func LoadProducts(baseDir, filename, store string) ([]models.Product, error) {
	path := filepath.Join(baseDir, filename)
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var storeData models.StoreData
	if err := json.NewDecoder(f).Decode(&storeData); err != nil {
		return nil, err
	}

	for i := range storeData.Data {
		storeData.Data[i].Store = store
		// Solo categorizar si no viene del scraper
		if storeData.Data[i].Category == "" {
			storeData.Data[i].Category = CategorizeProduct(storeData.Data[i].Name)
		}
	}
	return storeData.Data, nil
}

func SearchProducts(products []models.Product, query string) []models.Product {
	var results []models.Product
	for _, p := range products {
		if fuzzyMatch(p.Name, query) {
			results = append(results, p)
		}
	}
	return results
}
