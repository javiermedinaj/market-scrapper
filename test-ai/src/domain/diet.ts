import { normalize } from "../text";

export type Diet = "omnivore" | "vegetarian" | "vegan";

export interface DietProduct {
  name: string;
  category?: string;
}

const MEAT =
  /\b(carnes?|pollos?|pavos?|cerdos?|jamon(?:es)?|salchich(?:a|as)?|chorizos?|pescados?|atun(?:es)?|merluzas?|salmon(?:es)?|mariscos?|langostinos?|camaron(?:es)?|calamar(?:es)?|panceta|bondiola|costillas?|lomo|peceto|nalga|cuadril|matambre|morcilla|prosciutto|salami|mortadela|fiambres?|bife|asado)\b/;

const ANIMAL =
  /\b(leche|lacteos?|quesos?|yogur(?:es)?|manteca|huevos?|miel|ricota|mozzarella|parmesano|dulce de leche)\b/;

const PLANT =
  /\b(vegan[oa]s?|tofu|seitan|soja|almendras?|avena|coco|mani|castañas?|garbanzos?|lentejas?|porotos?|arvejas?)\b/;

const MEAT_CATEGORIES = new Set(["carnes", "pescados y mariscos"]);
const ANIMAL_CATEGORIES = new Set(["lacteos", "quesos y fiambres"]);

export function isAllowed(product: DietProduct, diet: Diet): boolean {
  if (diet === "omnivore") return true;

  const name = normalize(product.name);
  const category = normalize(product.category ?? "");

  if (MEAT_CATEGORIES.has(category) || MEAT.test(name)) return false;
  if (diet === "vegetarian") return true;

  if (ANIMAL_CATEGORIES.has(category)) return false;
  if (ANIMAL.test(name) && !PLANT.test(name)) return false;
  return true;
}

export function parseDiet(arg: string): Diet {
  const a = normalize(arg);
  if (a.startsWith("vegan") || a === "vegano" || a === "vegana") return "vegan";
  if (
    a === "veg" ||
    a.startsWith("veget") ||
    a === "vegetariano" ||
    a === "vegetariana"
  ) {
    return "vegetarian";
  }
  return "omnivore";
}

export function dietLabel(diet: Diet): string {
  if (diet === "vegan") return "vegana";
  if (diet === "vegetarian") return "vegetariana";
  return "omnívora";
}
