import { promises as fs } from "fs";
import path from "path";
import { Product, StoreData } from "@/types";
import {
  isSupabaseEnabled,
  loadProductsFromSupabase,
  upsertProducts,
  recordScrapingRun,
} from "./supabase";

export const DATA_DIR = path.join(process.cwd(), "data");

export function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

export function fuzzyMatch(name: string, query: string): boolean {
  const normalizedName = normalizeString(name);
  const words = normalizeString(query).split(/\s+/).filter(Boolean);
  return words.every((word) => normalizedName.includes(word));
}

export async function ensureDataDirs(): Promise<void> {
  await fs.mkdir(path.join(DATA_DIR, "daily"), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, "today"), { recursive: true });
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export async function saveHistoricalData(
  data: StoreData,
  storeSlug: string
): Promise<void> {
  if (process.env.VERCEL) {
    if (isSupabaseEnabled()) {
      await upsertProducts(data.data);
      await recordScrapingRun(data);
    }
    return;
  }

  await ensureDataDirs();

  const dailyDir = path.join(DATA_DIR, "daily", data.date);
  await fs.mkdir(dailyDir, { recursive: true });

  const dailyFile = path.join(dailyDir, `${storeSlug}-ofertas.json`);
  const todayFile = path.join(DATA_DIR, "today", `${storeSlug}-ofertas.json`);
  const currentFile = path.join(DATA_DIR, `${storeSlug}-ofertas.json`);

  const jsonData = JSON.stringify(data, null, 2);

  await fs.writeFile(dailyFile, jsonData, "utf-8");
  await fs.writeFile(todayFile, jsonData, "utf-8");
  await fs.writeFile(currentFile, jsonData, "utf-8");

  if (isSupabaseEnabled()) {
    try {
      await upsertProducts(data.data);
      await recordScrapingRun(data);
    } catch (error) {
      console.error("Error syncing to Supabase:", error);
    }
  }
}

export async function loadStoreData(storeSlug: string): Promise<StoreData | null> {
  try {
    const filePath = path.join(DATA_DIR, `${storeSlug}-ofertas.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as StoreData;
  } catch {
    return null;
  }
}

export async function loadTodayStoreData(storeSlug: string): Promise<StoreData | null> {
  if (process.env.VERCEL) {
    return null;
  }
  try {
    const today = getTodayDate();
    const filePath = path.join(DATA_DIR, "daily", today, `${storeSlug}-ofertas.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as StoreData;
  } catch {
    return loadStoreData(storeSlug);
  }
}

const ACTIVE_STORES = ["dia", "jumbo", "farmacity", "farma"];

export async function loadAllProducts(): Promise<Product[]> {
  if (isSupabaseEnabled()) {
    return await loadProductsFromSupabase();
  }

  if (process.env.VERCEL) {
    throw new Error("Supabase no configurado. Configurá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el environment de Vercel.");
  }

  const products: Product[] = [];
  for (const store of ACTIVE_STORES) {
    const data = await loadStoreData(store);
    if (data?.data) {
      products.push(...withStoreDefaults(data.data, data.store || store));
    }
  }

  return products;
}

export function withStoreDefaults(
  products: Product[],
  storeName: string
): Product[] {
  return products.map((p) => ({
    ...p,
    store: p.store || storeName,
  }));
}
