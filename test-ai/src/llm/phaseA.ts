import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { MAX_SEARCH_STEPS, modelSettings } from "../config";
import { searchProducts, type SearchResult } from "../data/products";
import { dietLabel, isAllowed, type Diet } from "../domain/diet";

export interface GatheredCandidates {
  candidates: SearchResult[];
  steps: number;
  toolCalls: number;
  phaseAMs: number;
  searchMs: number;
  searchCount: number;
}

function makeSearchTool(
  collector: Map<string, SearchResult>,
  stores: string[],
  diet: Diet,
  stats: { searchMs: number; searchCount: number; results: number },
) {
  return tool({
    description:
      "Busca productos reales del catálogo scrapeado de supermercados argentinos por palabras clave. Devuelve productId, nombre, precio en ARS, supermercado y categoría. Solo busca en el supermercado y la dieta configurados para esta corrida.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("Palabras clave en español, ej: 'fideos tirabuzon', 'tomate triturado'"),
    }),
    execute: async ({ query }) => {
      const started = Date.now();
      const results = (await searchProducts(query, 8, stores)).filter((p) =>
        isAllowed(p, diet),
      );
      stats.searchMs += Date.now() - started;
      stats.searchCount += 1;
      stats.results += results.length;
      for (const product of results) collector.set(product.productId, product);
      return results;
    },
  });
}

export async function gatherCandidates(
  servings: number,
  budgetArs: number,
  stores: string[],
  diet: Diet,
  log: (message: string) => void,
): Promise<GatheredCandidates> {
  const collector = new Map<string, SearchResult>();
  const stats = { searchMs: 0, searchCount: 0, results: 0 };
  const started = Date.now();

  const { steps } = await generateText({
    ...modelSettings(),
    tools: { search_products: makeSearchTool(collector, stores, diet, stats) },
    stopWhen: stepCountIs(MAX_SEARCH_STEPS),
    maxRetries: 3,
    system: [
      "Sos un cocinero argentino que arma cenas realistas y económicas con productos de supermercado.",
      `La cena debe ser estrictamente ${dietLabel(diet)}.`,
      "En un ÚNICO turno, pedí con la herramienta TODAS las búsquedas que necesites, en paralelo (varias llamadas a la vez).",
      "Buscá los productos de todos los ingredientes que usarías: proteína, guarnición, salsa y condimentos.",
      "No repitas búsquedas y no esperes resultados para pedir la siguiente: pedilas todas juntas.",
    ].join(" "),
    prompt: [
      `Vas a armar una cena ${dietLabel(diet)} para ${servings} porciones con presupuesto ${budgetArs} ARS.`,
      "Hacé todas las búsquedas que necesites en este único turno. No escribas la receta.",
    ].join(" "),
  });

  const phaseAMs = Date.now() - started;
  const toolCalls = steps.reduce(
    (sum, step) => sum + (step.toolCalls?.length ?? 0),
    0,
  );
  log(
    `  fase 1: ${collector.size} candidatos · ${toolCalls} búsquedas · ${steps.length} pasos · ${(phaseAMs / 1000).toFixed(1)}s`,
  );
  return {
    candidates: [...collector.values()],
    steps: steps.length,
    toolCalls,
    phaseAMs,
    searchMs: stats.searchMs,
    searchCount: stats.searchCount,
  };
}
