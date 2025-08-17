package handlers

func GetTotalProducts() int {
	totalProducts := 0

	mu.RLock()
	totalProducts += len(diaProducts)
	totalProducts += len(jumboProducts)
	totalProducts += len(farmacityProducts)
	totalProducts += len(farmaOnlineProducts)
	mu.RUnlock()

	return totalProducts
}
