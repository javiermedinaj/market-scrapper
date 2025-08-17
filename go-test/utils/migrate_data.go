package main

import (
	"log"
	"os"
	"path/filepath"
)

func MigrateExistingData() {
	dataDir := "../data"

	// Archivos a migrar
	files := map[string]string{
		"farmacity-ofertas.json": "Farmacity",
		"farma-ofertas.json":     "FarmaOnline",
		"dia-ofertas.json":       "Dia",
		"jumbo-ofertas.json":     "Jumbo",
	}

	log.Println("Iniciando migración de datos históricos...")

	for filename, storeName := range files {
		filePath := filepath.Join(dataDir, filename)

		// Verificar si existe el archivo
		if _, err := os.Stat(filePath); err == nil {
			log.Printf("Migrando %s para tienda %s...", filename, storeName)

			if err := LoadAndSaveFromJSON(filePath, storeName); err != nil {
				log.Printf("❌ Error migrando %s: %v", filename, err)
			} else {
				log.Printf("✅ Migrado exitosamente: %s", filename)
			}
		} else {
			log.Printf("⚠️ Archivo no encontrado: %s", filePath)
		}
	}

	log.Println("Migración completada")
}
