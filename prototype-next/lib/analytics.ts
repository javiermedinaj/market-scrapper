import { Product, StoreStats, CategoryStats } from "@/types";
import { loadAllProducts } from "./data";

const SUPERMARKETS = ["Día", "Jumbo"];
const PHARMACIES = ["Farmacity", "FarmaOnline"];

export function isSupermarket(store: string): boolean {
  return SUPERMARKETS.includes(store);
}

export function filterByCategory(products: Product[], category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function filterByStore(products: Product[], store: string): Product[] {
  return products.filter((p) => p.store === store);
}

export function filterByStoreType(products: Product[], isSupermarketType: boolean): Product[] {
  return products.filter((p) => isSupermarket(p.store || "") === isSupermarketType);
}

export function getStoreBreakdown(products: Product[]): Record<string, StoreStats> {
  const storeStats: Record<string, StoreStats> = {};

  for (const p of products) {
    const stat = storeStats[p.store];
    if (stat) {
      stat.productCount++;
      stat.totalSpent += p.price;
      stat.minPrice = Math.min(stat.minPrice, p.price);
      stat.maxPrice = Math.max(stat.maxPrice, p.price);
    } else {
      storeStats[p.store] = {
        storeName: p.store,
        productCount: 1,
        averagePrice: p.price,
        minPrice: p.price,
        maxPrice: p.price,
        totalSpent: p.price,
      };
    }
  }

  for (const stat of Object.values(storeStats)) {
    stat.averagePrice = stat.totalSpent / stat.productCount;
  }

  return storeStats;
}

export function getPriceComparison(products: Product[]) {
  if (products.length === 0) {
    return {
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      priceDiff: 0,
      cheapestStore: "",
    };
  }

  let totalPrice = 0;
  let minPrice = products[0].price;
  let maxPrice = products[0].price;
  let cheapestStore = products[0].store;

  for (const p of products) {
    totalPrice += p.price;
    if (p.price < minPrice) {
      minPrice = p.price;
      cheapestStore = p.store;
    }
    if (p.price > maxPrice) {
      maxPrice = p.price;
    }
  }

  return {
    avgPrice: totalPrice / products.length,
    minPrice,
    maxPrice,
    priceDiff: maxPrice - minPrice,
    cheapestStore,
  };
}

export function getStoreStats(products: Product[], storeName: string): StoreStats {
  const filtered = products.filter((p) => p.store === storeName);

  if (filtered.length === 0) {
    return {
      storeName,
      productCount: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      totalSpent: 0,
    };
  }

  let totalSpent = 0;
  let minPrice = filtered[0].price;
  let maxPrice = filtered[0].price;

  for (const p of filtered) {
    totalSpent += p.price;
    minPrice = Math.min(minPrice, p.price);
    maxPrice = Math.max(maxPrice, p.price);
  }

  return {
    storeName,
    productCount: filtered.length,
    averagePrice: totalSpent / filtered.length,
    minPrice,
    maxPrice,
    totalSpent,
  };
}

export function calculateCategoryStats(products: Product[]): Record<string, CategoryStats> {
  const stats: Record<string, CategoryStats> = {};
  const categoryProducts: Record<string, Product[]> = {};

  for (const p of products) {
    const category = p.category || "Otros";
    if (!categoryProducts[category]) categoryProducts[category] = [];
    categoryProducts[category].push(p);
  }

  for (const [category, products] of Object.entries(categoryProducts)) {
    if (products.length === 0) continue;

    const stores = getStoreBreakdown(products);
    const priceComparison = getPriceComparison(products);

    stats[category] = {
      category,
      stores,
      cheapestStore: priceComparison.cheapestStore,
      averagePrice: priceComparison.avgPrice,
      minPrice: priceComparison.minPrice,
      maxPrice: priceComparison.maxPrice,
      priceDiff: priceComparison.priceDiff,
      productCount: products.length,
    };
  }

  return stats;
}

export async function getAllAnalytics() {
  const products = await loadAllProducts();
  const categories = calculateCategoryStats(products);

  return {
    products,
    categories,
    supermarkets: {
      totalProducts: filterByStoreType(products, true).length,
      stores: Object.fromEntries(
        SUPERMARKETS.map((store) => [store, getStoreStats(products, store)])
      ),
    },
    pharmacies: {
      totalProducts: filterByStoreType(products, false).length,
      stores: Object.fromEntries(
        PHARMACIES.map((store) => [store, getStoreStats(products, store)])
      ),
    },
  };
}
