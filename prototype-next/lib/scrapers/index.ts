import { StoreData } from "@/types";
import scrapeDia from "./dia";
import scrapeJumbo from "./jumbo";
import scrapeFarmacity from "./farmacity";
import scrapeFarmaonline from "./farmaonline";

const ACTIVE_SCRAPERS = {
  dia: scrapeDia,
  jumbo: scrapeJumbo,
  farmacity: scrapeFarmacity,
  farma: scrapeFarmaonline,
  farmaonline: scrapeFarmaonline,
} as const;

const EXPERIMENTAL_SCRAPERS = {
  carrefour: () => import("./carrefour").then((m) => m.default()),
  coto: () => import("./coto").then((m) => m.default()),
} as const;

export type ScraperName =
  | keyof typeof ACTIVE_SCRAPERS
  | keyof typeof EXPERIMENTAL_SCRAPERS
  | "all";

export async function runScraper(name: ScraperName): Promise<StoreData[]> {
  if (name === "all") {
    const results: StoreData[] = [];
    for (const [scraperName, scraperFn] of Object.entries(ACTIVE_SCRAPERS)) {
      try {
        console.log(`\nEjecutando ${scraperName} scraper...`);
        const start = Date.now();
        const result = await scraperFn();
        const duration = Math.round((Date.now() - start) / 1000);
        console.log(`${scraperName} completado en ${duration}s (${result.totalProducts} productos)`);
        results.push(result);
      } catch (error) {
        console.error(`Error en ${scraperName}:`, error);
      }
    }
    return results;
  }

  const activeScraper = (ACTIVE_SCRAPERS as Record<string, () => Promise<StoreData>>)[name];
  if (activeScraper) return [await activeScraper()];

  const experimentalScraper = (EXPERIMENTAL_SCRAPERS as Record<string, () => Promise<StoreData>>)[name];
  if (experimentalScraper) return [await experimentalScraper()];

  throw new Error(
    `Scraper "${name}" no encontrado. Disponibles: ${[...Object.keys(ACTIVE_SCRAPERS), ...Object.keys(EXPERIMENTAL_SCRAPERS)].join(", ")}`
  );
}

export function listScrapers(): string[] {
  return Object.keys(ACTIVE_SCRAPERS);
}

export { scrapeDia, scrapeJumbo, scrapeFarmacity, scrapeFarmaonline };
