import type { Product } from "@/types";
import { isAllowed, type Diet } from "./diet";
import { normalize } from "./text";

export interface SearchOptions {
  stores?: string[];
  diet?: Diet;
  limit?: number;
}

export function searchForRecipes(
  products: Product[],
  query: string,
  options: SearchOptions = {},
): Product[] {
  const { stores, diet = "omnivore", limit = 8 } = options;
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const matches: { product: Product; hits: number }[] = [];
  for (const product of products) {
    if (!product.productId) continue;
    if (stores && !stores.includes(product.store)) continue;
    if (!isAllowed(product, diet)) continue;

    const haystack = normalize(product.name);
    let hits = 0;
    for (const term of terms) {
      if (haystack.includes(term)) hits += 1;
    }
    if (hits > 0) matches.push({ product, hits });
  }

  matches.sort(
    (a, b) =>
      b.hits - a.hits ||
      a.product.name.length - b.product.name.length ||
      a.product.price - b.product.price,
  );

  return matches.slice(0, limit).map(({ product }) => product);
}
