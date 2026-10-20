import { loadAllProducts } from "@/lib/data";
import { isSupabaseEnabled } from "@/lib/supabase";
import type { Product } from "@/types";

const TTL_MS = Number(process.env.AI_PRODUCTS_TTL_MINUTES ?? 10) * 60_000;

let cache: { at: number; products: Product[] } | null = null;

export async function getRecipeProducts(): Promise<Product[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.products;

  const products = (await loadAllProducts()).filter(
    (product) =>
      Boolean(product.productId) &&
      Number.isFinite(product.price) &&
      product.price > 0,
  );

  cache = { at: Date.now(), products };
  return products;
}

export function dataSource(): string {
  return isSupabaseEnabled() ? "supabase" : "json";
}
