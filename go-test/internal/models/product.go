package models

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
