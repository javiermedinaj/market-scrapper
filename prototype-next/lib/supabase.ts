import { createClient } from "@supabase/supabase-js";
import { Product, StoreData } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const PLACEHOLDER = "replace-with-secret-key-from-dashboard";
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey =
  rawServiceKey && rawServiceKey !== PLACEHOLDER
    ? rawServiceKey
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function isSupabaseEnabled(): boolean {
  return !!supabase;
}

export async function upsertProducts(products: Product[]): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");

  const rows = products.map((p) => ({
    name: p.name,
    price: p.price,
    link: p.link,
    image: p.image,
    store: p.store,
    category: p.category || "Otros",
    sub_category: p.subCategory,
    brand: p.brand,
    product_id: p.productId,
    description: p.description,
    scraped_at: p.scrapedAt,
  }));

  const { error } = await supabase.from("products").upsert(rows, {
    onConflict: "store,product_id",
  });

  if (error) throw error;
}

export async function loadProductsFromSupabase(): Promise<Product[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const PAGE_SIZE = 1000;
  const all: Record<string, unknown>[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("scraped_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...(data as unknown as Record<string, unknown>[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all.map((row) => ({
    name: row.name as string,
    price: row.price as number,
    link: row.link as string,
    image: (row.image as string | null) ?? "",
    store: row.store as string,
    category: (row.category as string | null) ?? "Otros",
    subCategory: (row.sub_category as string | null) ?? undefined,
    brand: (row.brand as string | null) ?? undefined,
    productId: (row.product_id as string | null) ?? undefined,
    description: (row.description as string | null) ?? undefined,
    scrapedAt: (row.scraped_at as string | null) ?? undefined,
  }));
}

export async function recordScrapingRun(run: StoreData): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from("scraping_runs").insert({
    store: run.store,
    run_date: run.date,
    total_products: run.totalProducts,
    started_at: run.timestamp,
    completed_at: run.lastUpdate,
  });

  if (error) console.error("Error recording scraping run:", error);
}
