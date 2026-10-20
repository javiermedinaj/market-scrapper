import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_BUDGET_ARS } from "../config";
import { dietLabel, parseDiet } from "../domain/diet";
import { resolveStores, runPlan } from "../pipeline";

const publicDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "public",
);

function readParams() {
  const servings = Number(process.argv[2] ?? 2);
  const budgetArs = Number(process.argv[3] ?? DEFAULT_BUDGET_ARS);
  const storeArg = process.argv[4] ?? "both";
  const diet = parseDiet(process.argv[5] ?? "omnivore");
  return { servings, budgetArs, storeArg, diet };
}

async function main() {
  const { servings, budgetArs, storeArg, diet } = readParams();
  const { label, stores } = resolveStores(storeArg);

  console.log(
    `Cena ${dietLabel(diet)} para ${servings} · presupuesto ${budgetArs} ARS · supermercado: ${label}\n`,
  );

  const result = await runPlan({
    servings,
    budgetArs,
    stores,
    storeLabel: label,
    diet,
    log: (message) => console.log(message),
  });

  console.log(JSON.stringify(result.recipe, null, 2));

  const payload = {
    generatedAt: new Date().toISOString(),
    stage: 2,
    model: result.model,
    dataSource: result.dataSource,
    params: { servings, budgetArs, store: label, diet: result.diet },
    status: result.overBudget ? "over_budget" : "ok",
    total: result.total,
    stale: result.stale,
    priceAgeDays: result.priceAgeDays,
    newestScrapedAt: result.newestScrapedAt,
    attempts: result.attempts,
    steps: result.steps,
    toolCalls: result.toolCalls,
    candidates: result.candidates,
    semanticWarnings: result.semanticWarnings,
    dietViolations: result.dietViolations,
    ingredients: result.ingredients,
    recipe: {
      title: result.recipe.title,
      servings: result.recipe.servings,
      steps: result.recipe.steps,
    },
    usage: result.usage,
  };

  await mkdir(publicDir, { recursive: true });
  await writeFile(join(publicDir, "recipe.json"), JSON.stringify(payload, null, 2));
  console.log("→ public/recipe.json actualizado. Corré 'npm run view' para verlo.");
}

main().catch((error) => {
  console.error("Falló stage 2:", error);
  process.exit(1);
});
