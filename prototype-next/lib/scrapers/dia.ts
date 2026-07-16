import { Product, StoreData } from "@/types";
import {
  fetchWithRetry,
  buildProductFromVtex,
  saveStoreData,
  VtexProduct,
} from "./base";

interface DiaItem {
  productName: string;
  link: string;
  brand: string;
  brandId: number;
  productId: string;
  categoryId: string;
  categories: string[];
  items: {
    images: { imageUrl: string }[];
    sellers: { commertialOffer: { Price: number } }[];
  }[];
}

export async function scrapeDia(): Promise<StoreData> {
  const storeName = "Día";
  const storeSlug = "dia";
  const baseUrl = "https://diaonline.supermercadosdia.com.ar";
  const pageSize = 50;
  let from = 0;
  const products: Product[] = [];
  const scrapedAt = new Date().toISOString();

  while (true) {
    const to = from + pageSize - 1;
    const url = `${baseUrl}/api/catalog_system/pub/products/search?productClusterIds=567&_from=${from}&_to=${to}`;

    console.log(`➡️ Día: Requesting ${from}–${to}`);
    const response = await fetchWithRetry(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    });

    const diaItems = (await response.json()) as DiaItem[];
    console.log(`✅ Día: Página ${from}–${to}: ${diaItems.length} productos`);

    if (diaItems.length === 0) break;

    for (const item of diaItems) {
      const price = item.items?.[0]?.sellers?.[0]?.commertialOffer?.Price ?? 0;
      if (price <= 0 || price > 999_999) {
        console.log(`⚠️ Día: Precio inválido descartado: ${item.productName} (${price})`);
        continue;
      }

      const image = item.items?.[0]?.images?.[0]?.imageUrl ?? "";
      const category = item.categories?.length
        ? item.categories[item.categories.length - 1]
            .split("/")
            .filter(Boolean)
            .pop()
        : "";

      products.push({
        name: item.productName,
        price,
        link: item.link,
        image,
        brand: item.brand,
        productId: item.productId,
        category,
        scrapedAt,
        store: storeName,
      });
    }

    from += pageSize;
  }

  return saveStoreData(products, storeName, storeSlug);
}

export default scrapeDia;
