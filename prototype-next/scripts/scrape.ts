import { runScraper, ScraperName, listScrapers } from "@/lib/scrapers";

async function main() {
  const arg = process.argv[2] ?? "all";

  if (arg === "--help" || arg === "-h") {
    console.log("Uso: pnpm scrape [nombre|all] (default: all)");
    console.log(`Scrapers disponibles: ${listScrapers().join(", ")}, all`);
    process.exit(0);
  }

  const scraper = arg as ScraperName;
  const startTime = Date.now();
  console.log(`🚀 Iniciando scraper: ${scraper}`);

  try {
    const results = await runScraper(scraper);
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`\n🎉 Proceso completado en ${duration}s`);
    console.log("\n📋 Resumen:");
    results.forEach((result) => {
      console.log(`  ✅ ${result.store}: ${result.totalProducts} productos`);
    });

    if (results.length === 0 || results.every((r) => r.totalProducts === 0)) {
      console.error(
        "❌ No se scrapeó ningún producto. Failing para no silenciar el error.",
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error general:", error);
    process.exit(1);
  }
}

main();
