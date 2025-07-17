package main

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type Product struct {
	Name  string `json:"name"`
	Price string `json:"price"`
	Store string `json:"store"`
	Link  string `json:"link"`
	Image string `json:"image"`
}

type StoreData struct {
	Data []Product `json:"data"`
}

func normalize(s string) string {
	s = strings.ToLower(s)
	replacer := strings.NewReplacer(
		"á", "a", "é", "e", "í", "i", "ó", "o", "ú", "u",
		"ü", "u", "ñ", "n",
	)
	s = replacer.Replace(s)
	return s
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

func loadProducts(baseDir, filename, store string) ([]Product, error) {
	path := filepath.Join(baseDir, "data", filename)
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var storeData StoreData
	if err := json.NewDecoder(f).Decode(&storeData); err != nil {
		return nil, err
	}

	for i := range storeData.Data {
		storeData.Data[i].Store = store
	}
	return storeData.Data, nil
}

func main() {
	baseDir := "."
	diaProducts, _ := loadProducts(baseDir, "dia-ofertas.json", "Día")
	jumboProducts, _ := loadProducts(baseDir, "jumbo-ofertas.json", "Jumbo")
	all := append(diaProducts, jumboProducts...)

	http.HandleFunc("/search", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query().Get("q")
		var results []Product
		for _, p := range all {
			if fuzzyMatch(p.Name, q) {
				results = append(results, p)
			}
		}
		w.Header().Set("Access-Control-Allow-Origin", "https://offers-ba.vercel.app")
		json.NewEncoder(w).Encode(results)
	})

	http.ListenAndServe(":8080", nil)
}
