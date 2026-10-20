import { generateText, Output } from "ai";
import { modelSettings } from "../config";
import type { SearchResult } from "../data/products";
import { dietLabel, type Diet } from "../domain/diet";
import { RecipeSchema } from "../domain/recipe";

export async function finalizeRecipe(
  candidates: SearchResult[],
  servings: number,
  budgetArs: number,
  diet: Diet,
  feedback: string | null,
) {
  const catalog = candidates
    .map((p) => `${p.productId}\t${p.name}\t$${p.price}\t${p.store}`)
    .join("\n");

  return generateText({
    ...modelSettings(),
    output: Output.object({ schema: RecipeSchema }),
    maxRetries: 3,
    system: [
      "Sos un cocinero argentino que arma cenas realistas y económicas.",
      `La receta debe ser estrictamente ${dietLabel(diet)}: no uses ingredientes prohibidos.`,
      "Armás la receta usando SOLO productos de la lista disponible, por su productId EXACTO.",
      "Cada productId debe corresponder al ingrediente por su nombre: no enganches 'puré de tomate' a una cebolla de verdeo.",
      "No inventes ingredientes ni productos fuera de la lista.",
      "NO calcules el total: el sistema lo hace por vos.",
      feedback ? `Corrección: ${feedback}` : "",
    ]
      .filter(Boolean)
      .join(" "),
    prompt: [
      `Armá una cena ${dietLabel(diet)} para ${servings} porciones, presupuesto ${budgetArs} ARS.`,
      "Productos disponibles (productId, nombre, precio, supermercado):",
      catalog,
    ].join("\n\n"),
  });
}
