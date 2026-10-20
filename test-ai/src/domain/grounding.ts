import type { Product } from "../data/products";
import { normalize } from "../text";
import { costOf, type SaleFormat } from "./cost";
import { isAllowed, type Diet } from "./diet";
import type { Recipe } from "./recipe";

export interface PricedIngredient {
  name: string;
  quantity: number;
  unit: string;
  productId: string;
  productName?: string;
  store?: string;
  price?: number;
  cost?: number;
  pantry?: boolean;
  saleFormat?: SaleFormat["kind"];
  packages?: number;
  image?: string;
  link?: string;
  scrapedAt?: string;
}

const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "con", "x", "y", "al", "por", "en",
  "un", "una", "para", "sin", "mas", "gr", "g", "kg", "ml", "l", "lt", "lts",
]);

function tokens(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

export function isSemanticMatch(
  ingredientName: string,
  productName: string,
): boolean {
  const ingredientTokens = tokens(ingredientName);
  if (ingredientTokens.length === 0) return true;
  const product = normalize(productName);
  return ingredientTokens.some((t) => product.includes(t));
}

export function groundRecipe(
  recipe: Recipe,
  catalog: Map<string, Product>,
  diet: Diet,
) {
  const ingredients: PricedIngredient[] = [];
  const missing: string[] = [];
  const mismatches: string[] = [];
  const dietViolations: string[] = [];
  let total = 0;

  for (const ingredient of recipe.ingredients) {
    const product = catalog.get(ingredient.productId);
    if (!product) {
      missing.push(ingredient.productId);
      ingredients.push({ ...ingredient });
      continue;
    }

    if (!isAllowed(product, diet)) {
      dietViolations.push(`"${ingredient.name}" → "${product.name}"`);
    }
    if (!isSemanticMatch(ingredient.name, product.name)) {
      mismatches.push(`"${ingredient.name}" → "${product.name}"`);
    }

    const priced = costOf(
      ingredient.quantity,
      ingredient.unit,
      product.name,
      product.price,
    );
    total += priced.cost;

    ingredients.push({
      ...ingredient,
      productName: product.name,
      store: product.store,
      price: product.price,
      cost: priced.cost,
      pantry: priced.pantry,
      saleFormat: priced.saleFormat,
      packages: priced.packages,
      image: product.image,
      link: product.link,
      scrapedAt: product.scrapedAt,
    });
  }

  return { ingredients, missing, mismatches, dietViolations, total };
}
