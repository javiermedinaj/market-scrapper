import { createClient } from "@supabase/supabase-js";
import { Product, StoreData } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("scraped_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    name: row.name,
    price: row.price,
    link: row.link,
    image: row.image,
    store: row.store,
    category: row.category,
    subCategory: row.sub_category,
    brand: row.brand,
    productId: row.product_id,
    description: row.description,
    scrapedAt: row.scraped_at,
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
