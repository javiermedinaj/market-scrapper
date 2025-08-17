package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"go-test/internal/models"
)

type HistoricalData struct {
	Date     string           `json:"date"`
	Products []models.Product `json:"products"`
	Store    string           `json:"store"`
}

type ScrapedDataWithMeta struct {
	Timestamp     string           `json:"timestamp"`
	Date          string           `json:"date"`
	Time          string           `json:"time"`
	Store         string           `json:"store"`
	TotalProducts int              `json:"totalProducts"`
	LastUpdate    string           `json:"lastUpdate"`
	Data          []models.Product `json:"data"`
}

func SaveHistoricalData(products []models.Product, store string) error {
	data := HistoricalData{
		Date:     time.Now().Format("2006-01-02"),
		Products: products,
		Store:    store,
	}

	baseDir := filepath.Join("../data", "daily")
	dateDir := filepath.Join(baseDir, time.Now().Format("2006-01-02"))
	if err := os.MkdirAll(dateDir, 0755); err != nil {
		return fmt.Errorf("error creating directory: %v", err)
	}

	filename := filepath.Join(dateDir, fmt.Sprintf("%s-ofertas.json", strings.ToLower(store)))
	file, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("error creating file: %v", err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(data); err != nil {
		return fmt.Errorf("error encoding data: %v", err)
	}

	fmt.Printf("✅ Datos históricos guardados: %s (%d productos)\n", filename, len(products))
	return nil
}

func LoadAndSaveFromJSON(jsonFile, store string) error {
	data, err := os.ReadFile(jsonFile)
	if err != nil {
		return fmt.Errorf("error reading file %s: %v", jsonFile, err)
	}

	var products []models.Product

	var scrapedData ScrapedDataWithMeta
	if err := json.Unmarshal(data, &scrapedData); err == nil && len(scrapedData.Data) > 0 {
		products = scrapedData.Data
		fmt.Printf("Cargados %d productos de %s (formato con metadatos)\n", len(products), store)
	} else {
		if err := json.Unmarshal(data, &products); err != nil {
			return fmt.Errorf("error unmarshaling JSON (probé ambos formatos): %v", err)
		}
		fmt.Printf("Cargados %d productos de %s (formato directo)\n", len(products), store)
	}

	return SaveHistoricalData(products, store)
}
