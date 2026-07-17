import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PLACEHOLDER = "replace-with-secret-key-from-dashboard";
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_KEY =
  rawServiceKey && rawServiceKey !== PLACEHOLDER
    ? rawServiceKey
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltan variables de entorno de Supabase");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection(): Promise<{ ok: boolean; count: number; error: string | null }> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  if (error) return { ok: false, count: 0, error: error.message };
  return { ok: true, count: count ?? 0, error: null };
}

const STORE_MAP: Record<string, string> = {
  "dia-ofertas.json": "dia",
  "jumbo-ofertas.json": "jumbo",
  "farmacity-ofertas.json": "farmacity",
  "farma-ofertas.json": "farmaonline",
};

const FILES = [
  "data/dia-ofertas.json",
  "data/jumbo-ofertas.json",
  "data/farmacity-ofertas.json",
  "data/farma-ofertas.json",
];

const BATCH_SIZE = 500;

type RawProduct = {
  name?: string;
  price?: number;
  link?: string;
  image?: string;
  brand?: string;
  productId?: string;
  categoryId?: string;
  category?: string;
  description?: string;
  scrapedAt?: string;
};

type Row = {
  name: string;
  price: number;
  link: string;
  image: string | null;
  store: string;
  category: string;
  sub_category: string | null;
  brand: string | null;
  product_id: string;
  description: string | null;
  scraped_at: string | null;
};

function mapProduct(p: RawProduct, store: string): Row | null {
  if (!p.name || !p.link || p.price == null || !p.productId) {
    return null;
  }
  return {
    name: p.name,
    price: p.price,
    link: p.link,
    image: p.image ?? null,
    store,
    category: p.category ?? "Otros",
    sub_category: p.categoryId ?? null,
    brand: p.brand ?? null,
    product_id: p.productId,
    description: p.description ?? null,
    scraped_at: p.scrapedAt ?? null,
  };
}

function dedupeByKey(rows: Row[]): Row[] {
  const seen = new Map<string, Row>();
  for (const r of rows) {
    seen.set(`${r.store}::${r.product_id}`, r);
  }
  return Array.from(seen.values());
}

async function loadJson(path: string): Promise<{ store: string; products: RawProduct[] }> {
  const fileName = path.split("/").pop() || "";
  const store = STORE_MAP[fileName];
  if (!store) throw new Error(`Store desconocido para ${fileName}`);

  const abs = resolve(process.cwd(), path);
  const text = await readFile(abs, "utf8");
  const json = JSON.parse(text);
  const data: RawProduct[] = Array.isArray(json) ? json : json.data || [];
  return { store, products: data };
}

async function upsertBatch(rows: Row[]): Promise<{ inserted: number; error: string | null }> {
  const { error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "store,product_id" });

  if (error) return { inserted: 0, error: error.message };
  return { inserted: rows.length, error: null };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`Modo: ${dryRun ? "DRY RUN (no se sube nada)" : "REAL"}`);
  console.log(`URL: ${SUPABASE_URL}`);
  const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== "replace-with-secret-key-from-dashboard";
  console.log(`Key usada: ${usingServiceRole ? "service_role" : "publishable/anon"}`);
  console.log("");

  if (!dryRun) {
    const { error: probeErr } = await supabase.from("products").select("id").limit(1);
    if (probeErr) {
      console.error(`Conexión a Supabase falló: ${JSON.stringify(probeErr)}`);
      process.exit(1);
    }
    console.log("Conexión OK");
    console.log("");
  }

  let totalRead = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const file of FILES) {
    const { store, products } = await loadJson(file);
    const rows: Row[] = [];
    for (const p of products) {
      const mapped = mapProduct(p, store);
      if (mapped) rows.push(mapped);
      else totalSkipped++;
    }

    totalRead += products.length;
    console.log(`[${store}] ${products.length} productos leídos, ${rows.length} válidos, ${products.length - rows.length} descartados`);

    if (dryRun) {
      totalInserted += rows.length;
      continue;
    }

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = dedupeByKey(rows.slice(i, i + BATCH_SIZE));
      const result = await upsertBatch(batch);
      if (result.error) {
        totalErrors += batch.length;
        console.error(`  Error en batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.error}`);
      } else {
        totalInserted += result.inserted;
        console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.inserted} productos`);
      }
    }

    if (!dryRun) {
      const runDate = new Date().toISOString().slice(0, 10);
      const { error: runErr } = await supabase.from("scraping_runs").insert({
        store,
        run_date: runDate,
        total_products: rows.length,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
      if (runErr) {
        console.error(`  Error registrando scraping_run: ${runErr.message}`);
      } else {
        console.log(`  scraping_run registrado para ${store} del ${runDate}`);
      }
    }
  }

  console.log("");
  console.log("=== RESUMEN ===");
  console.log(`Leídos:    ${totalRead}`);
  console.log(`Válidos:   ${totalInserted}`);
  console.log(`Saltados:  ${totalSkipped}`);
  console.log(`Errores:   ${totalErrors}`);
  if (dryRun) {
    console.log("(DRY RUN - nada se subió a Supabase)");
  }
}

main().catch((e) => {
  console.error("Error fatal:", e);
  process.exit(1);
});
