import { Product, StoreData } from "@/types";
import {
  fetchWithRetry,
  buildProductFromVtex,
  saveStoreData,
  VtexProduct,
} from "./base";

export async function scrapeJumbo(): Promise<StoreData> {
  const storeName = "Jumbo";
  const storeSlug = "jumbo";
  const baseUrl = "https://www.jumbo.com.ar";
  const clusterId = "50532";
  const pageSize = 50;
  const maxFrom = 2500;
  let from = 0;
  const products: Product[] = [];
  const scrapedAt = new Date().toISOString();

  for (from = 0; from < maxFrom; from += pageSize) {
    const to = from + pageSize - 1;
    const url = `${baseUrl}/api/catalog_system/pub/products/search?productClusterIds=${clusterId}&_from=${from}&_to=${to}`;

    console.log(`📄 Jumbo: Obteniendo productos ${from}-${to}...`);
    const response = await fetchWithRetry(url);

    const vtexProducts = (await response.json()) as VtexProduct[];
    console.log(`✅ Jumbo: Encontrados ${vtexProducts.length} productos`);

    if (vtexProducts.length === 0) break;

    for (const vp of vtexProducts) {
      const product = buildProductFromVtex(vp, storeName, baseUrl, scrapedAt);
      if (product) {
        products.push(product);
      } else {
        console.log(`⚠️ Jumbo: Precio inválido: ${vp.productName}`);
      }
    }
  }

  return saveStoreData(products, storeName, storeSlug);
}

export default scrapeJumbo;
