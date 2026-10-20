import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import type { Product } from "@/types";
import { dietLabel, type Diet } from "./diet";
import { MAX_SEARCH_STEPS, modelSettings } from "./model";
import { searchForRecipes } from "./search";

export interface GatheredCandidates {
  candidates: Product[];
  steps: number;
  toolCalls: number;
  phaseAMs: number;
  searchMs: number;
  searchCount: number;
}

export async function gatherCandidates(
  products: Product[],
  servings: number,
  budgetArs: number,
  stores: string[],
  diet: Diet,
  log: (message: string) => void,
): Promise<GatheredCandidates> {
  const collector = new Map<string, Product>();
  const stats = { searchMs: 0, searchCount: 0 };
  const started = Date.now();

  const searchTool = tool({
    description:
      "Busca productos reales del catálogo de supermercados argentinos por palabras clave. Devuelve productId, nombre, precio en ARS, supermercado y categoría. Solo busca en el supermercado y la dieta configurados.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("Palabras clave en español, ej: 'fideos tirabuzon', 'tomate triturado'"),
    }),
    execute: async ({ query }) => {
      const searchStarted = Date.now();
      const results = searchForRecipes(products, query, {
        stores,
        diet,
        limit: 8,
      });
      stats.searchMs += Date.now() - searchStarted;
      stats.searchCount += 1;
      for (const product of results) {
        if (product.productId) collector.set(product.productId, product);
      }
      return results.map((product) => ({
        productId: product.productId,
        name: product.name,
        price: product.price,
        store: product.store,
        category: product.category,
      }));
    },
  });

  const { steps } = await generateText({
    ...modelSettings(),
    tools: { search_products: searchTool },
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
