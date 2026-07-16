export interface Product {
  name: string;
  price: number;
  link: string;
  image: string;
  store: string;
  category?: string;
  subCategory?: string;
  scrapedAt?: string;
  brand?: string;
  productId?: string;
  description?: string;
}

export interface StoreData {
  timestamp: string;
  date: string;
  time: string;
  store: string;
  totalProducts: number;
  lastUpdate: string;
  data: Product[];
}

export interface StoreInfo {
  name: string;
  displayName: string;
  type: 'supermarket' | 'pharmacy';
}

export interface CategoryStats {
  category: string;
  subCategory?: string;
  stores: Record<string, StoreStats>;
  cheapestStore: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceDiff: number;
  productCount: number;
}

export interface StoreStats {
  storeName: string;
  productCount: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalSpent: number;
}

export interface SearchResponse {
  query: string;
  count: number;
  data: Product[];
}
