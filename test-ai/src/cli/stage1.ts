import { generateText, Output } from "ai";
import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_BUDGET_ARS, MODEL_ID, modelSettings } from "../config";

const publicDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "public",
);

const IngredientSchema = z.object({
  name: z
    .string()
    .describe("Nombre del ingrediente en español, como figuraría en la góndola"),
  quantity: z.number().describe("Cantidad necesaria para toda la receta"),
  unit: z
    .enum(["g", "kg", "ml", "l", "unidad", "cucharada", "cucharadita", "taza"])
    .describe("Unidad de medida"),
});

const RecipeSchema = z.object({
  title: z.string().describe("Nombre del plato"),
  servings: z.number().int().describe("Porciones que rinde la receta"),
  ingredients: z.array(IngredientSchema).min(1),
  steps: z.array(z.string()).min(1).describe("Pasos de cocción, en orden"),
  estimatedTotalArs: z
    .number()
    .describe("Costo total estimado de la receta, en pesos argentinos"),
});

function readParams() {
  const servings = Number(process.argv[2] ?? 2);
  const budgetArs = Number(process.argv[3] ?? DEFAULT_BUDGET_ARS);
  return { servings, budgetArs };
}

async function main() {
  const { servings, budgetArs } = readParams();

  const { output, usage } = await generateText({
    ...modelSettings(),
    output: Output.object({ schema: RecipeSchema }),
    system: [
      "Sos un cocinero argentino que arma cenas realistas y económicas.",
      "Usás ingredientes que se consiguen en supermercados argentinos.",
      "Devolvés porciones y pasos concretos, sin relleno.",
    ].join(" "),
    prompt: [
      `Armá una receta para la cena de ${servings} porciones.`,
      `El presupuesto total es de ${budgetArs} ARS.`,
      "Incluí un estimado del costo total en ARS.",
    ].join(" "),
  });

  console.log(JSON.stringify(output, null, 2));
  console.log("\nusage:", usage);

  const payload = {
    generatedAt: new Date().toISOString(),
    model: MODEL_ID,
    params: { servings, budgetArs },
    recipe: output,
    usage: {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
    },
  };

  await mkdir(publicDir, { recursive: true });
  await writeFile(
    join(publicDir, "recipe.json"),
    JSON.stringify(payload, null, 2),
  );
  console.log("\n→ public/recipe.json actualizado. Corré 'npm run view' para verlo.");
}

main().catch((error) => {
  console.error("Falló stage 1:", error);
  process.exit(1);
});
