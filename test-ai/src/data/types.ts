export interface Product {
  productId: string;
  name: string;
  price: number;
  store: string;
  category?: string;
  brand?: string;
  image?: string;
  link?: string;
  scrapedAt?: string;
}

export interface SearchResult {
  productId: string;
  name: string;
  price: number;
  store: string;
  category?: string;
  image?: string;
  link?: string;
  scrapedAt?: string;
}
