import { writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
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

const TABLES = [
  { name: "products", columns: [
    "id", "name", "price", "link", "image", "store", "category",
    "sub_category", "brand", "product_id", "description", "scraped_at",
    "created_at", "updated_at",
  ]},
  { name: "scraping_runs", columns: [
    "id", "store", "run_date", "total_products", "started_at",
    "completed_at", "created_at",
  ]},
];

const PAGE_SIZE = 1000;

function escapeValue(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (v instanceof Date) return `'${v.toISOString()}'`;
  const s = String(v);
  return `'${s.replace(/'/g, "''")}'`;
}

async function fetchAll(table: string, columns: string[]): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns.join(","))
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Error leyendo ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as unknown as Record<string, unknown>[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

function buildSql(tables: typeof TABLES, data: Record<string, Record<string, unknown>[]>): string {
  const lines: string[] = [];
  lines.push("-- Backup generado por market-scrapper");
  lines.push(`-- Fecha: ${new Date().toISOString()}`);
  lines.push(`-- URL: ${SUPABASE_URL}`);
  lines.push("");

  for (const t of tables) {
    const rows = data[t.name] || [];
    lines.push(`-- Tabla ${t.name}: ${rows.length} filas`);
    if (rows.length === 0) continue;

    for (const row of rows) {
      const values = t.columns.map((c) => escapeValue(row[c])).join(", ");
      const cols = t.columns.map((c) => `"${c}"`).join(", ");
      lines.push(`INSERT INTO public.${t.name} (${cols}) VALUES (${values});`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const stamp = new Date().toISOString().slice(0, 10);
  const outFile = process.argv[2] || `backup-${stamp}.sql.gz`;

  const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== PLACEHOLDER;
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Key: ${usingServiceRole ? "service_role" : "publishable/anon"}`);
  console.log(`Output: ${outFile}`);
  console.log("");

  const data: Record<string, Record<string, unknown>[]> = {};
  for (const t of TABLES) {
    console.log(`Leyendo ${t.name}...`);
    data[t.name] = await fetchAll(t.name, t.columns);
    console.log(`  ${data[t.name].length} filas`);
  }

  const sql = buildSql(TABLES, data);
  const gz = gzipSync(Buffer.from(sql, "utf8"), { level: 9 });

  await writeFile(outFile, gz);
  const sizeKb = Math.round(gz.length / 1024);
  console.log("");
  console.log(`✓ Backup escrito: ${outFile} (${sizeKb} KB)`);
}

main().catch((e) => {
  console.error("Error fatal:", e);
  process.exit(1);
});
