import { Product } from "@/types";
import { normalizeString, fuzzyMatch } from "./data";

export { fuzzyMatch } from "./data";

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return [];
  return products.filter((p) => fuzzyMatch(p.name, query));
}
