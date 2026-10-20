import { normalize } from "./text";

export type SaleFormat =
  | { kind: "package"; amount: number; unit: string }
  | { kind: "per_kg" }
  | { kind: "per_unit"; packSize: number }
  | { kind: "unknown" };

export interface CostResult {
  cost: number;
  pantry: boolean;
  saleFormat: SaleFormat["kind"];
  packages?: number;
}

const PANTRY =
  /\b(sal|aceite|vinagre|pimienta|condimento|oregano|pimenton|comino|laurel|curry|bicarbonato)\b/;

export function isPantry(name: string): boolean {
  return PANTRY.test(normalize(name));
}

export function parseSaleFormat(name: string): SaleFormat {
  const n = normalize(name);

  if (/\b(?:x|por)\s*(?:\d+(?:[.,]\d+)?\s*)?kg\b/.test(n)) {
    return { kind: "per_kg" };
  }

  const unitMatch = n.match(
    /\b(?:x|por)\s*(\d+)?\s*(?:un|unidad|unidades|ud|uds)\b/,
  );
  if (unitMatch) {
    return {
      kind: "per_unit",
      packSize: unitMatch[1] ? Number(unitMatch[1]) : 1,
    };
  }

  const match = n.match(
    /(\d+(?:[.,]\d+)?)\s*(kg|kilos?|gr|g|gramos?|ml|lt|lts|l|litros?|cc)\b/,
  );
  if (match) {
    return {
      kind: "package",
      amount: Number(match[1].replace(",", ".")),
      unit: match[2],
    };
  }

  return { kind: "unknown" };
}

type Dimension = "mass" | "volume" | "unit";

function toBase(
  amount: number,
  unit: string,
): { dimension: Dimension; value: number } | null {
  const u = normalize(unit);
  if (u === "kg" || u === "kilo" || u === "kilos") {
    return { dimension: "mass", value: amount * 1000 };
  }
  if (u === "g" || u === "gr" || u === "gramo" || u === "gramos") {
    return { dimension: "mass", value: amount };
  }
  if (u === "l" || u === "lt" || u === "lts" || u === "litro" || u === "litros") {
    return { dimension: "volume", value: amount * 1000 };
  }
  if (u === "ml" || u === "cc") {
    return { dimension: "volume", value: amount };
  }
  if (u === "unidad" || u === "un" || u === "unidades" || u === "ud" || u === "uds") {
    return { dimension: "unit", value: amount };
  }
  return null;
}

export function costOf(
  quantity: number,
  unit: string,
  productName: string,
  price: number,
): CostResult {
  const pantry = isPantry(productName);
  const saleFormat = parseSaleFormat(productName);

  if (pantry) {
    return { cost: 0, pantry: true, saleFormat: saleFormat.kind };
  }

  if (saleFormat.kind === "per_kg") {
    const needed = toBase(quantity, unit);
    if (needed?.dimension === "mass") {
      return {
        cost: Math.round(price * (needed.value / 1000)),
        pantry,
        saleFormat: saleFormat.kind,
      };
    }
    return { cost: Math.round(price), pantry, saleFormat: saleFormat.kind };
  }

  if (saleFormat.kind === "per_unit") {
    const needed = toBase(quantity, unit);
    if (needed?.dimension === "unit") {
      const packSize = saleFormat.packSize > 0 ? saleFormat.packSize : 1;
      const packages = Math.max(1, Math.ceil(needed.value / packSize));
      return {
        cost: packages * price,
        pantry,
        saleFormat: saleFormat.kind,
        packages,
      };
    }
    return { cost: Math.round(price), pantry, saleFormat: saleFormat.kind };
  }

  if (saleFormat.kind === "package") {
    const needed = toBase(quantity, unit);
    const size = toBase(saleFormat.amount, saleFormat.unit);
    if (
      needed &&
      size &&
      needed.dimension === size.dimension &&
      size.value > 0
    ) {
      const packages = Math.max(1, Math.ceil(needed.value / size.value));
      return {
        cost: packages * price,
        pantry,
        saleFormat: saleFormat.kind,
        packages,
      };
    }
    return { cost: Math.round(price), pantry, saleFormat: saleFormat.kind };
  }

  return { cost: Math.round(price), pantry, saleFormat: saleFormat.kind };
}
