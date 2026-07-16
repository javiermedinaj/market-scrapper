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

  // Si Supabase está configurado, sincronizamos
  if (isSupabaseEnabled()) {
    try {
      await upsertProducts(data.data);
      await recordScrapingRun(data);
    } catch (error) {
      console.error("❌ Error syncing to Supabase:", error);
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
  try {
    const today = getTodayDate();
    const filePath = path.join(DATA_DIR, "daily", today, `${storeSlug}-ofertas.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as StoreData;
  } catch {
    return loadStoreData(storeSlug);
  }
}

export async function loadAllProducts(): Promise<Product[]> {
  // Si Supabase está configurado, usamos la base de datos
  if (isSupabaseEnabled()) {
    try {
      return await loadProductsFromSupabase();
    } catch (error) {
      console.error("❌ Error loading from Supabase, falling back to JSON:", error);
    }
  }

  // Fallback: archivos JSON
  const stores = ["dia", "jumbo", "farmacity", "farma", "carrefour", "coto"];
  const products: Product[] = [];

  for (const store of stores) {
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
