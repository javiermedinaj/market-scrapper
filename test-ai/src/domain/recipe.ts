import { z } from "zod";

export const IngredientSchema = z.object({
  name: z.string().describe("Ingrediente con el nombre que usarías al cocinar"),
  quantity: z.number().describe("Cantidad para cocinar la receta completa"),
  unit: z.enum(["g", "kg", "ml", "l", "unidad", "cucharada", "cucharadita", "taza"]),
  productId: z
    .string()
    .describe("productId EXACTO de la lista de productos disponibles"),
});

export const RecipeSchema = z.object({
  title: z.string(),
  servings: z.number().int(),
  ingredients: z.array(IngredientSchema).min(1),
  steps: z.array(z.string()).min(1),
});

export type Recipe = z.infer<typeof RecipeSchema>;
