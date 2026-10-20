import { MAX_ATTEMPTS, MODEL_ID, STALE_AFTER_DAYS } from "./config";
import { DATA_SOURCE, loadProducts, type Product } from "./data/products";
import type { Diet } from "./domain/diet";
import { groundRecipe, type PricedIngredient } from "./domain/grounding";
import type { Recipe } from "./domain/recipe";
import { gatherCandidates } from "./llm/phaseA";
import { finalizeRecipe } from "./llm/phaseB";

export { MAX_ATTEMPTS, MODEL_ID, MAX_SEARCH_STEPS, resolveStores } from "./config";

export interface PlanParams {
  servings: number;
  budgetArs: number;
  stores: string[];
  storeLabel: string;
  diet: Diet;
  log?: (message: string) => void;
}

export interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  textTokens?: number;
}

export interface Timings {
  totalMs: number;
  loadProductsMs: number;
  phaseAMs: number;
  phaseBMs: number[];
  searchMs: number;
  searchCount: number;
  modelRequests: number;
  reasoningTokens: number;
}

export interface PlanResult {
  model: string;
  dataSource: string;
  storeLabel: string;
  diet: Diet;
  recipe: Recipe;
  ingredients: PricedIngredient[];
  total: number;
  overBudget: boolean;
  attempts: number;
  steps: number;
  toolCalls: number;
  candidates: number;
  semanticWarnings: string[];
  dietViolations: string[];
  priceAgeDays: number | null;
  stale: boolean;
  newestScrapedAt: string | null;
  attemptLog: string[];
  usage: TokenUsage;
  timings: Timings;
}

export async function runPlan(params: PlanParams): Promise<PlanResult> {
  const { servings, budgetArs, stores, storeLabel, diet } = params;
  const log = params.log ?? (() => {});
  const startedAt = Date.now();

  const loadStarted = Date.now();
  const catalog = new Map<string, Product>(
    (await loadProducts()).map((product) => [product.productId, product]),
  );
  const loadProductsMs = Date.now() - loadStarted;
  log(`  datos: ${catalog.size} productos (${DATA_SOURCE}) cargados en ${loadProductsMs}ms`);

  const gathered = await gatherCandidates(servings, budgetArs, stores, diet, log);
  if (gathered.candidates.length === 0) {
    throw new Error("NO_CANDIDATES: el modelo no encontró productos en esa tienda");
  }

  let feedback: string | null = null;
  const phaseBMs: number[] = [];
  const attemptLog: string[] = [];
  let chosen:
    | {
        recipe: Recipe;
        ingredients: PricedIngredient[];
        total: number;
        overBudget: boolean;
        attempts: number;
        semanticWarnings: string[];
        dietViolations: string[];
        usage: TokenUsage;
      }
    | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const attemptStarted = Date.now();
    const { output, usage } = await finalizeRecipe(
      gathered.candidates,
      servings,
      budgetArs,
      diet,
      feedback,
    );
    phaseBMs.push(Date.now() - attemptStarted);
    const grounded = groundRecipe(output, catalog, diet);

    if (grounded.missing.length > 0) {
      feedback = `estos productId no están en la lista disponible: ${grounded.missing.join(", ")}.`;
      attemptLog.push(`#${attempt} productId inválidos: ${grounded.missing.join(", ")}`);
      log(`  ✗ intento ${attempt}: productId inválidos`);
      continue;
    }

    if (grounded.dietViolations.length > 0 && attempt < MAX_ATTEMPTS) {
      feedback = `estos productos no cumplen la dieta ${diet}: ${grounded.dietViolations.join("; ")}. Elegí otro producto que sí cumpla.`;
      attemptLog.push(`#${attempt} dieta: ${grounded.dietViolations.join("; ")}`);
      log(`  ✗ intento ${attempt}: violación de dieta`);
      continue;
    }

    if (grounded.mismatches.length > 0 && attempt < MAX_ATTEMPTS) {
      feedback = `estos ingredientes quedaron enganchados a un producto que no corresponde: ${grounded.mismatches.join("; ")}. Elegí un producto cuyo nombre coincida con el ingrediente.`;
      attemptLog.push(`#${attempt} mismatch: ${grounded.mismatches.join("; ")}`);
      log(`  ✗ intento ${attempt}: mismatch semántico`);
      continue;
    }

    const overBudget = grounded.total > budgetArs;
    chosen = {
      recipe: output,
      ingredients: grounded.ingredients,
      total: grounded.total,
      overBudget,
      attempts: attempt,
      semanticWarnings: grounded.mismatches,
      dietViolations: grounded.dietViolations,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        reasoningTokens: usage.outputTokenDetails?.reasoningTokens,
        textTokens: usage.outputTokenDetails?.textTokens,
      },
    };
    attemptLog.push(
      `#${attempt} ${overBudget ? "sobre budget" : "OK"}: $${grounded.total}`,
    );
    log(
      `  intento ${attempt}: $${grounded.total} ${overBudget ? "→ SOBRE presupuesto" : "→ OK"} · ${(phaseBMs[phaseBMs.length - 1] / 1000).toFixed(1)}s · ${usage.outputTokens ?? "?"} tokens out`,
    );

    if (!overBudget) break;

    feedback = `tu receta costó ${grounded.total} ARS, ${grounded.total - budgetArs} ARS por encima del presupuesto de ${budgetArs}. Elegí productos más baratos o menos ingredientes.`;
  }

  if (!chosen) {
    throw new Error("NO_VALID_RECIPE: no se logró una receta válida en el límite de intentos");
  }

  const scrapedTimes = chosen.ingredients
    .map((ingredient) =>
      ingredient.scrapedAt ? Date.parse(ingredient.scrapedAt) : Number.NaN,
    )
    .filter((time) => Number.isFinite(time));
  const oldestScraped = scrapedTimes.length ? Math.min(...scrapedTimes) : null;
  const newestScraped = scrapedTimes.length ? Math.max(...scrapedTimes) : null;
  const priceAgeDays =
    oldestScraped == null
      ? null
      : Math.floor((Date.now() - oldestScraped) / 86_400_000);
  const stale = priceAgeDays != null && priceAgeDays > STALE_AFTER_DAYS;
  const newestScrapedAt =
    newestScraped == null ? null : new Date(newestScraped).toISOString();

  if (stale) {
    log(
      `  ⚠ precios con ${priceAgeDays} días de antigüedad (último scrape: ${newestScrapedAt})`,
    );
  }

  const totalMs = Date.now() - startedAt;
  log(`  total pipeline: ${(totalMs / 1000).toFixed(1)}s`);

  return {
    model: MODEL_ID,
    dataSource: DATA_SOURCE,
    storeLabel,
    diet,
    ...chosen,
    steps: gathered.steps,
    toolCalls: gathered.toolCalls,
    candidates: gathered.candidates.length,
    priceAgeDays,
    stale,
    newestScrapedAt,
    attemptLog,
    timings: {
      totalMs,
      loadProductsMs,
      phaseAMs: gathered.phaseAMs,
      phaseBMs,
      searchMs: gathered.searchMs,
      searchCount: gathered.searchCount,
      modelRequests: gathered.steps + chosen.attempts,
      reasoningTokens: chosen.usage.reasoningTokens ?? 0,
    },
  };
}
