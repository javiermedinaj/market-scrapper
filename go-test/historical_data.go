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

func saveHistoricalData(products []models.Product, store string) error {
	data := HistoricalData{
		Date:     time.Now().Format("2006-01-02"),
		Products: products,
		Store:    store,
	}
	exePath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("error getting executable path: %v", err)
	}
	projectRoot := filepath.Dir(filepath.Dir(exePath)) // Go up two levels

	baseDir := filepath.Join(projectRoot, "data", "daily")
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

	return nil
}
