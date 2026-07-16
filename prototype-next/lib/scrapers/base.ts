import { Product, StoreData } from "@/types";
import { saveHistoricalData } from "@/lib/data";
import { categorizeProduct } from "@/lib/categories";

export interface VtexItem {
  images: { imageUrl: string }[];
  sellers: { commertialOffer: { Price: number } }[];
}

export interface VtexProduct {
  productName: string;
  linkText: string;
  link: string;
  productId: string;
  brand: string;
  brandId: number;
  categoryId: string;
  categoryTree?: { id: string; name: string }[];
  categories?: string[];
  items: VtexItem[];
  description?: string;
}

export function extractCategory(
  categoryTree?: { id: string; name: string }[],
  categories?: string[]
): string {
  if (categoryTree && categoryTree.length > 0) {
    return categoryTree[categoryTree.length - 1].name;
  }
  if (categories && categories.length > 0) {
    const parts = categories[categories.length - 1].split("/");
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i]?.trim();
      if (part) return part;
    }
  }
  return "";
}

export function stripHTML(text: string): string {
  return text
    .replace(/&[^;]+;/g, (entity) => {
      const textarea = typeof document !== "undefined" ? document.createElement("textarea") : null;
      if (textarea) {
        textarea.innerHTML = entity;
        return textarea.value;
      }
      return entity;
    })
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildProductFromVtex(
  vp: VtexProduct,
  storeName: string,
  baseUrl: string,
  scrapedAt: string
): Product | null {
  const price = vp.items?.[0]?.sellers?.[0]?.commertialOffer?.Price ?? 0;
  if (price <= 0 || price > 999_999) return null;

  const image = vp.items?.[0]?.images?.[0]?.imageUrl ?? "";
  const link = vp.link || `${baseUrl}/${vp.linkText}/p`;
  const category = extractCategory(vp.categoryTree, vp.categories);
  const description = vp.description ? stripHTML(vp.description) : "";

  return {
    name: vp.productName,
    price,
    link,
    image,
    brand: vp.brand,
    productId: vp.productId,
    category,
    description,
    scrapedAt,
    store: storeName,
  };
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    ...(options.headers as Record<string, string>),
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const response = await fetch(url, { ...options, headers });
      if (response.ok || response.status === 206) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error(`Failed to fetch ${url}`);
}

export async function saveStoreData(
  products: Product[],
  storeName: string,
  storeSlug: string
): Promise<StoreData> {
  const now = new Date();
  const data: StoreData = {
    timestamp: now.toISOString(),
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0],
    store: storeName,
    totalProducts: products.length,
    lastUpdate: now.toISOString(),
    data: products.map((p) => ({
      ...p,
      category: p.category || categorizeProduct(p.name),
      store: p.store || storeName,
    })),
  };

  await saveHistoricalData(data, storeSlug);
  return data;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
