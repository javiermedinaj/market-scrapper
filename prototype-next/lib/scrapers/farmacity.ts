import { Product, StoreData } from "@/types";
import {
  fetchWithRetry,
  buildProductFromVtex,
  saveStoreData,
  VtexProduct,
} from "./base";

export async function scrapeFarmacity(): Promise<StoreData> {
  const storeName = "Farmacity";
  const storeSlug = "farmacity";
  const baseUrl = "https://www.farmacity.com";
  const pageSize = 50;
  const maxProducts = 2500;
  const products: Product[] = [];
  const scrapedAt = new Date().toISOString();

  for (let from = 0; from < maxProducts; from += pageSize) {
    const to = Math.min(from + pageSize - 1, maxProducts - 1);
    const url = `${baseUrl}/api/catalog_system/pub/products/search?_from=${from}&_to=${to}`;

    console.log(`📄 Farmacity: Obteniendo productos ${from}-${to}...`);
    const response = await fetchWithRetry(url);

    const vtexProducts = (await response.json()) as VtexProduct[];
    console.log(`✅ Farmacity: Página procesada. Total: ${products.length}`);

    if (vtexProducts.length === 0) break;

    for (const vp of vtexProducts) {
      const product = buildProductFromVtex(vp, storeName, baseUrl, scrapedAt);
      if (product) {
        products.push(product);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return saveStoreData(products, storeName, storeSlug);
}

export default scrapeFarmacity;
