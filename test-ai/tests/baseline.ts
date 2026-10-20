import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_BUDGET_ARS } from "../src/config";
import { DATA_SOURCE } from "../src/data/products";
import type { PricedIngredient } from "../src/domain/grounding";
import { dietLabel, parseDiet } from "../src/domain/diet";
import { MODEL_ID, resolveStores, runPlan, type Timings } from "../src/pipeline";

interface Case {
  name: string;
  storeArg: string;
  servings: number;
  budgetArs: number;
}

const ALL_CASES: Case[] = [
  { name: "dia", storeArg: "dia", servings: 2, budgetArs: DEFAULT_BUDGET_ARS },
  { name: "jumbo", storeArg: "jumbo", servings: 2, budgetArs: DEFAULT_BUDGET_ARS },
];

const filter = process.argv[2];
const reps = Number(process.argv[3] ?? 3) || 3;
const delayMs = Number(process.argv[4] ?? 60000);
const diet = parseDiet(process.argv[5] ?? "omnivore");

const cases = filter ? ALL_CASES.filter((c) => c.name === filter) : ALL_CASES;
if (cases.length === 0) {
  console.error(`Caso desconocido: "${filter}". Usá: dia | jumbo`);
  process.exit(1);
}

interface RunRecord {
  case: string;
  run: number;
  parsed: boolean;
  withinBudget: boolean;
  clean: boolean;
  rateLimited: boolean;
  title?: string;
  ingredients?: PricedIngredient[];
  total?: number;
  attempts?: number;
  warnings: string[];
  dietViolations?: string[];
  stale?: boolean;
  priceAgeDays?: number | null;
  attemptLog?: string[];
  usage?: { inputTokens?: number; outputTokens?: number; reasoningTokens?: number };
  timings?: Timings;
  error?: string;
}

function pct(n: number, d: number): string {
  return d === 0 ? "—" : `${Math.round((n / d) * 100)}% (${n}/${d})`;
}

function average(values: number[]): number | null {
  return values.length === 0
    ? null
    : Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function seconds(ms: number | undefined): string {
  return ms == null ? "—" : `${(ms / 1000).toFixed(1)}s`;
}

function isRateLimit(message: string): boolean {
  return /rate.?limit|GatewayRateLimit|429/i.test(message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const records: RunRecord[] = [];
  const totalRuns = cases.length * reps;
  let runIndex = 0;

  console.log(`Modelo: ${MODEL_ID} · dieta: ${dietLabel(diet)} · datos: ${DATA_SOURCE}`);

  for (const testCase of cases) {
    const { label, stores } = resolveStores(testCase.storeArg);
    console.log(
      `\n=== ${label} · ${testCase.servings} porciones · $${testCase.budgetArs} · ${reps} corridas ===`,
    );

    for (let run = 1; run <= reps; run += 1) {
      runIndex += 1;
      const started = Date.now();
      try {
        const result = await runPlan({
          servings: testCase.servings,
          budgetArs: testCase.budgetArs,
          stores,
          storeLabel: label,
          diet,
        });
        const clean =
          !result.overBudget &&
          result.semanticWarnings.length === 0 &&
          result.dietViolations.length === 0;
        const t = result.timings;
        records.push({
          case: testCase.name,
          run,
          parsed: true,
          withinBudget: !result.overBudget,
          clean,
          rateLimited: false,
          title: result.recipe.title,
          ingredients: result.ingredients,
          total: result.total,
          attempts: result.attempts,
          warnings: result.semanticWarnings,
          dietViolations: result.dietViolations,
          stale: result.stale,
          priceAgeDays: result.priceAgeDays,
          attemptLog: result.attemptLog,
          usage: {
            inputTokens: result.usage.inputTokens,
            outputTokens: result.usage.outputTokens,
            reasoningTokens: result.usage.reasoningTokens,
          },
          timings: result.timings,
        });
        console.log(
          `  #${run} ${clean ? "OK   " : "FALLA"} $${result.total} · ` +
            `intentos=${result.attempts} · f1=${seconds(t.phaseAMs)} · ` +
            `f2=${t.phaseBMs.map((ms) => (ms / 1000).toFixed(1)).join("+")}s · ` +
            `search=${seconds(t.searchMs)} · req=${t.modelRequests} · ` +
            `reason=${t.reasoningTokens} · ${seconds(Date.now() - started)}` +
            `${result.overBudget ? " [over_budget]" : ""}` +
            `${result.semanticWarnings.length ? ` [mismatch: ${result.semanticWarnings.join("; ")}]` : ""}` +
            `${result.dietViolations.length ? ` [dieta: ${result.dietViolations.join("; ")}]` : ""}` +
            `${result.stale ? ` [stale ${result.priceAgeDays}d]` : ""}` +
            `${result.attempts > 1 ? `\n      intentos: ${result.attemptLog.join(" → ")}` : ""}`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : String(error);
        records.push({
          case: testCase.name,
          run,
          parsed: false,
          withinBudget: false,
          clean: false,
          rateLimited: isRateLimit(message),
          warnings: [],
          error: message,
        });
        console.log(
          `  #${run} ERROR${isRateLimit(message) ? " (rate limit)" : ""} ${message} (${seconds(Date.now() - started)})`,
        );
      }

      if (runIndex < totalRuns && delayMs > 0) {
        console.log(`  … esperando ${(delayMs / 1000).toFixed(0)}s (límite 5 req/min)`);
        await sleep(delayMs);
      }
    }
  }

  console.log("\n=== Resumen (confiabilidad, no promedio) ===");
  for (const testCase of cases) {
    const runs = records.filter((r) => r.case === testCase.name);
    const valid = runs.filter((r) => !r.rateLimited);
    const parsed = valid.filter((r) => r.parsed).length;
    const withinBudget = valid.filter((r) => r.parsed && r.withinBudget).length;
    const clean = valid.filter((r) => r.clean).length;
    const avgTotal = average(
      valid.filter((r) => r.total != null).map((r) => r.total as number),
    );
    const avgAttempts = average(
      valid.filter((r) => r.attempts != null).map((r) => r.attempts as number),
    );
    const timings = valid
      .filter((r) => r.timings != null)
      .map((r) => r.timings as Timings);
    const avgPhaseA = average(timings.map((t) => t.phaseAMs));
    const avgPhaseB = average(
      timings.flatMap((t) => (t.phaseBMs.length ? [t.phaseBMs[0]] : [])),
    );
    const avgSearch = average(timings.map((t) => t.searchMs));
    const avgLoad = average(timings.map((t) => t.loadProductsMs));
    const avgRequests = average(timings.map((t) => t.modelRequests));

    console.log(
      `${testCase.name.padEnd(6)} JSON válido ${pct(parsed, valid.length)} · ` +
        `dentro de budget ${pct(withinBudget, valid.length)} · ` +
        `limpio ${pct(clean, valid.length)} · ` +
        `total prom ${avgTotal == null ? "—" : `$${avgTotal}`} · ` +
        `intentos prom ${avgAttempts ?? "—"}` +
        `${runs.length - valid.length > 0 ? ` · rate-limited ${runs.length - valid.length} (excluido)` : ""}`,
    );
    console.log(
      `${"".padEnd(6)} tiempos prom: fase1 ${seconds(avgPhaseA ?? undefined)} · ` +
        `fase2 ${seconds(avgPhaseB ?? undefined)} · search ${seconds(avgSearch ?? undefined)} · ` +
        `load ${seconds(avgLoad ?? undefined)} · req ${avgRequests ?? "—"}`,
    );
  }

  if (records.some((r) => r.rateLimited)) {
    console.log(
      "\nNota: las corridas rate-limited NO cuentan como fallo de calidad. " +
        "Subí el delay entre corridas: `npm run test:dia -- 3 90000`.",
    );
  }

  const outDir = join(dirname(fileURLToPath(import.meta.url)), "results");
  await mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapshot = {
    generatedAt: new Date().toISOString(),
    model: MODEL_ID,
    dataSource: DATA_SOURCE,
    diet,
    reps,
    delayMs,
    cases: cases.map((c) => ({
      name: c.name,
      servings: c.servings,
      budgetArs: c.budgetArs,
    })),
    records,
  };
  const outPath = join(outDir, `baseline-${stamp}.json`);
  await writeFile(outPath, JSON.stringify(snapshot, null, 2));
  console.log(`\n→ resultados guardados en ${outPath}`);
}

main().catch((error) => {
  console.error("Falló el baseline:", error);
  process.exit(1);
});
