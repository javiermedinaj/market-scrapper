import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Product } from "./types";

const PAGE_SIZE = 1000;
const SELECT =
  "name,price,store,category,brand,product_id,image,link,scraped_at";
const CACHE_FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  ".cache",
  "supabase-products.json",
);
const CACHE_TTL_MS =
  Number(process.env.CACHE_TTL_MINUTES ?? 10) * 60_000;

function config(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase no configurado: faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }
  return { url, key };
}

function mapRow(row: Record<string, unknown>): Product {
  return {
    productId: String(row.product_id ?? ""),
    name: String(row.name ?? ""),
    price: Number(row.price ?? 0),
    store: String(row.store ?? ""),
    category: row.category ? String(row.category) : undefined,
    brand: row.brand ? String(row.brand) : undefined,
    image: row.image ? String(row.image) : undefined,
    link: row.link ? String(row.link) : undefined,
    scrapedAt: row.scraped_at ? String(row.scraped_at) : undefined,
  };
}

async function readCache(): Promise<Product[] | null> {
  if (process.env.REFRESH_DATA === "1") return null;
  try {
    const cached = JSON.parse(await readFile(CACHE_FILE, "utf8")) as {
      fetchedAt: number;
      products: Product[];
    };
    if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.products;
  } catch {
    // sin cache
  }
  return null;
}

async function writeCache(products: Product[]): Promise<void> {
  await mkdir(dirname(CACHE_FILE), { recursive: true });
  await writeFile(
    CACHE_FILE,
    JSON.stringify({ fetchedAt: Date.now(), products }),
  );
}

async function fetchPage(
  url: string,
  key: string,
  offset: number,
): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams({
    select: SELECT,
    order: "id.asc",
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  const response = await fetch(`${url}/rest/v1/products?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) {
    throw new Error(`Supabase respondió HTTP ${response.status}`);
  }
  return (await response.json()) as Record<string, unknown>[];
}

export async function loadProductsFromSupabase(): Promise<Product[]> {
  const cached = await readCache();
  if (cached) return cached;

  const { url, key } = config();

  const countResponse = await fetch(
    `${url}/rest/v1/products?select=id&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
    },
  );
  if (!countResponse.ok) {
    throw new Error(`Supabase respondió HTTP ${countResponse.status}`);
  }

  // Content-Range: "0-0/10049"
  const range = countResponse.headers.get("content-range") ?? "";
  const total = Number(range.split("/")[1] ?? 0);
  if (!Number.isFinite(total) || total <= 0) return [];

  const pages: Record<string, unknown>[] = [];
  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    pages.push(...(await fetchPage(url, key, offset)));
  }

  const products = pages.map(mapRow);
  await writeCache(products);
  return products;
}
