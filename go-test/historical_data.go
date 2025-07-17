package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type HistoricalData struct {
	Date     string    `json:"date"`
	Products []Product `json:"products"`
	Store    string    `json:"store"`
}

func saveHistoricalData(products []Product, store string) error {
	// Crear la estructura de datos históricos
	data := HistoricalData{
		Date:     time.Now().Format("2006-01-02"),
		Products: products,
		Store:    store,
	}

	// Crear la estructura de carpetas para el día actual
	baseDir := "data/daily"
	dateDir := filepath.Join(baseDir, time.Now().Format("2006-01-02"))
	if err := os.MkdirAll(dateDir, 0755); err != nil {
		return fmt.Errorf("error creating directory: %v", err)
	}

	// Guardar el archivo JSON
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

	return nil
}
