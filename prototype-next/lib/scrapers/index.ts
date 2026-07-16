import { StoreData } from "@/types";
import scrapeDia from "./dia";
import scrapeJumbo from "./jumbo";
import scrapeFarmacity from "./farmacity";
import scrapeFarmaonline from "./farmaonline";
import scrapeCarrefour from "./carrefour";
import scrapeCoto from "./coto";

export type ScraperName =
  | "dia"
  | "jumbo"
  | "farmacity"
  | "farma"
  | "farmaonline"
  | "carrefour"
  | "coto"
  | "all";

const scrapers: Record<string, () => Promise<StoreData>> = {
  dia: scrapeDia,
  jumbo: scrapeJumbo,
  farmacity: scrapeFarmacity,
  farma: scrapeFarmaonline,
  farmaonline: scrapeFarmaonline,
  carrefour: scrapeCarrefour,
  coto: scrapeCoto,
};

export async function runScraper(name: ScraperName): Promise<StoreData[]> {
  if (name === "all") {
    const results: StoreData[] = [];
    for (const [scraperName, scraperFn] of Object.entries(scrapers)) {
      try {
        console.log(`\n🚀 Ejecutando ${scraperName} scraper...`);
        const start = Date.now();
        const result = await scraperFn();
        const duration = Math.round((Date.now() - start) / 1000);
        console.log(`✅ ${scraperName} completado en ${duration}s (${result.totalProducts} productos)`);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error en ${scraperName}:`, error);
      }
    }
    return results;
  }

  const scraper = scrapers[name];
  if (!scraper) {
    throw new Error(`Scraper "${name}" no encontrado. Disponibles: ${Object.keys(scrapers).join(", ")}`);
  }

  return [await scraper()];
}

export function listScrapers(): string[] {
  return Object.keys(scrapers);
}

export { scrapeDia, scrapeJumbo, scrapeFarmacity, scrapeFarmaonline, scrapeCarrefour, scrapeCoto };
