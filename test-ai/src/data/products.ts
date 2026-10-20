import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalize } from "../text";
import { loadProductsFromSupabase } from "./supabase";
import type { Product, SearchResult } from "./types";

export type { Product, SearchResult } from "./types";

export const DATA_SOURCE =
  process.env.DATA_SOURCE ??
  (process.env.NEXT_PUBLIC_SUPABASE_URL ? "supabase" : "json");

const dataDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "prototype-next",
  "data",
);

let cache: Product[] | null = null;

export async function loadProducts(): Promise<Product[]> {
  if (cache) return cache;

  if (DATA_SOURCE === "supabase") {
    cache = await loadProductsFromSupabase();
    return cache;
  }

  const files = (await readdir(dataDir)).filter((f) =>
    f.endsWith("-ofertas.json"),
  );

  const products: Product[] = [];
  for (const file of files) {
    const parsed = JSON.parse(await readFile(join(dataDir, file), "utf8"));
    const store: string = parsed.store ?? file.replace("-ofertas.json", "");
    for (const item of parsed.data ?? []) {
      products.push({
        productId: String(item.productId),
        name: item.name,
        price: item.price,
        store,
        category: item.category,
        brand: item.brand,
        image: item.image,
        link: item.link,
        scrapedAt: item.scrapedAt,
      });
    }
  }

  cache = products;
  return cache;
}

export async function searchProducts(
  query: string,
  limit = 8,
  stores?: string[],
): Promise<SearchResult[]> {
  const products = await loadProducts();
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const matches: { product: Product; matches: number }[] = [];
  for (const product of products) {
    if (stores && !stores.includes(product.store)) continue;
    const haystack = normalize(product.name);
    let hits = 0;
    for (const term of terms) {
      if (haystack.includes(term)) hits += 1;
    }
    if (hits > 0) matches.push({ product, matches: hits });
  }

  matches.sort(
    (a, b) =>
      b.matches - a.matches ||
      a.product.name.length - b.product.name.length ||
      a.product.price - b.product.price,
  );

  return matches.slice(0, limit).map(({ product }) => ({
    productId: product.productId,
    name: product.name,
    price: product.price,
    store: product.store,
    category: product.category,
    image: product.image,
    link: product.link,
    scrapedAt: product.scrapedAt,
  }));
}
