package models

type Product struct {
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Link        string  `json:"link"`
	Image       string  `json:"image"`
	Store       string  `json:"store"`
	Category    string  `json:"category"`
	SubCategory string  `json:"subCategory,omitempty"`
	ScrapedAt   string  `json:"scrapedAt,omitempty"`
	Brand       string  `json:"brand,omitempty"`
	ProductId   string  `json:"productId,omitempty"`
	Description string  `json:"description,omitempty"`
}

type CategoryStats struct {
	Category      string                `json:"category"`
	SubCategory   string                `json:"subCategory,omitempty"`
	Stores        map[string]StoreStats `json:"stores"`
	CheapestStore string                `json:"cheapestStore"`
	AveragePrice  float64               `json:"averagePrice"`
	MinPrice      float64               `json:"minPrice"`
	MaxPrice      float64               `json:"maxPrice"`
	PriceDiff     float64               `json:"priceDiff"`
	ProductCount  int                   `json:"productCount"`
}

type StoreStats struct {
	StoreName    string  `json:"storeName"`
	ProductCount int     `json:"productCount"`
	AveragePrice float64 `json:"averagePrice"`
	MinPrice     float64 `json:"minPrice"`
	MaxPrice     float64 `json:"maxPrice"`
	TotalSpent   float64 `json:"totalSpent"`
}

type StoreData struct {
	Data []Product `json:"data"`
}
