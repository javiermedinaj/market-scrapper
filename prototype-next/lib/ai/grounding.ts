import type { Product } from "@/types";
import { costOf, type SaleFormat } from "./cost";
import { isAllowed, type Diet } from "./diet";
import type { Recipe } from "./recipe";
import { normalize } from "./text";
import type { PricedIngredient } from "./types";

const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "con", "x", "y", "al", "por", "en",
  "un", "una", "para", "sin", "mas", "gr", "g", "kg", "ml", "l", "lt", "lts",
]);

function tokens(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

export function safeHttpUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function isSemanticMatch(
  ingredientName: string,
  productName: string,
): boolean {
  const ingredientTokens = tokens(ingredientName);
  if (ingredientTokens.length === 0) return true;
  const product = normalize(productName);
  return ingredientTokens.some((token) => product.includes(token));
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
      image: safeHttpUrl(product.image),
      link: safeHttpUrl(product.link),
      scrapedAt: product.scrapedAt,
    });
  }

  return { ingredients, missing, mismatches, dietViolations, total };
}

export type { SaleFormat };
