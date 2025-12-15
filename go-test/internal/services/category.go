package services

import (
	"strings"
)

var categoryMap = map[string]string{
	// Lácteos
	"leche":          "Lácteos",
	"queso":          "Lácteos",
	"yogur":          "Lácteos",
	"yogurt":         "Lácteos",
	"manteca":        "Lácteos",
	"mantequilla":    "Lácteos",
	"crema":          "Lácteos",
	"dulce de leche": "Lácteos",

	// Bebidas
	"café":    "Bebidas",
	"te":      "Bebidas",
	"té":      "Bebidas",
	"coca":    "Bebidas",
	"pepsi":   "Bebidas",
	"fanta":   "Bebidas",
	"sprite":  "Bebidas",
	"cerveza": "Bebidas",
	"vino":    "Bebidas",
	"jugo":    "Bebidas",
	"agua":    "Bebidas",

	// Panadería
	"pan":          "Panadería",
	"galletita":    "Panadería",
	"galleta":      "Panadería",
	"facturas":     "Panadería",
	"medialunas":   "Panadería",
	"baguette":     "Panadería",
	"pan integral": "Panadería",
	"bizcochos":    "Panadería",

	// Granos y Cereales
	"arroz":    "Granos",
	"fideos":   "Granos",
	"pasta":    "Granos",
	"lentejas": "Granos",
	"avena":    "Granos",
	"maiz":     "Granos",
	"harina":   "Granos",
	"trigo":    "Granos",

	// Frutas y Verduras
	"tomate":    "Verduras",
	"lechuga":   "Verduras",
	"papa":      "Verduras",
	"patata":    "Verduras",
	"zanahoria": "Verduras",
	"cebolla":   "Verduras",
	"ajo":       "Verduras",
	"espinaca":  "Verduras",
	"broccoli":  "Verduras",
	"calabaza":  "Verduras",
	"champiñon": "Verduras",
	"manzana":   "Frutas",
	"banana":    "Frutas",
	"naranja":   "Frutas",
	"fresa":     "Frutas",
	"uva":       "Frutas",
	"mandarina": "Frutas",
	"limón":     "Frutas",
	"melocotón": "Frutas",

	// Salud y Medicinas
	"aspirina":         "Salud",
	"ibuprofen":        "Salud",
	"ibupirufen":       "Salud",
	"vitamina":         "Salud",
	"pastilla":         "Salud",
	"medicamento":      "Salud",
	"analgésico":       "Salud",
	"jarabe":           "Salud",
	"antibiótico":      "Salud",
	"antiacido":        "Salud",
	"antiinflamatorio": "Salud",

	// Carne y Proteínas
	"pollo":     "Carnes",
	"carne":     "Carnes",
	"huevo":     "Carnes",
	"atún":      "Carnes",
	"pescado":   "Carnes",
	"jamón":     "Carnes",
	"mortadela": "Carnes",

	// Productos de Limpieza
	"detergente":    "Limpieza",
	"jabón":         "Limpieza",
	"lejía":         "Limpieza",
	"cloro":         "Limpieza",
	"papel":         "Limpieza",
	"desinfectante": "Limpieza",
	"limpiador":     "Limpieza",
	"desodorante":   "Limpieza",

	// Snacks
	"chocolate": "Snacks",
	"dulce":     "Snacks",
	"caramelo":  "Snacks",
	"choco":     "Snacks",
	"chip":      "Snacks",
	"papas":     "Snacks",
	"maní":      "Snacks",
	"almendra":  "Snacks",
	"nuez":      "Snacks",
}

func CategorizeProduct(productName string) string {
	nameLower := strings.ToLower(productName)

	for keyword, category := range categoryMap {
		if strings.Contains(nameLower, keyword) {
			return category
		}
	}

	return "Otros"
}
