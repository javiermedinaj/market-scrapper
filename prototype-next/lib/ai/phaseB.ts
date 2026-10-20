import { generateText, Output } from "ai";
import type { Product } from "@/types";
import { dietLabel, type Diet } from "./diet";
import { modelSettings } from "./model";
import { RecipeSchema } from "./recipe";

export async function finalizeRecipe(
  candidates: Product[],
  servings: number,
  budgetArs: number,
  diet: Diet,
  feedback: string | null,
) {
  const catalog = candidates
    .map((product) => `${product.productId}\t${product.name}\t$${product.price}\t${product.store}`)
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
