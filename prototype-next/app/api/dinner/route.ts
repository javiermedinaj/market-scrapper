import { NextResponse } from "next/server";
import {
  DEFAULT_BUDGET_ARS,
  parseDiet,
  resolveStores,
  runPlan,
} from "@/lib/ai/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BUDGET_ARS = 1_000_000;
const MAX_BODY_BYTES = 10_000;

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request demasiado grande." },
        { status: 413 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const servings = Number(body.servings ?? 2);
    const budgetArs = Number(body.budgetArs ?? DEFAULT_BUDGET_ARS);
    const storeArg = typeof body.store === "string" ? body.store : "both";
    const diet = parseDiet(
      typeof body.diet === "string" ? body.diet : "omnivore",
    );

    if (!Number.isFinite(servings) || servings <= 0 || servings > 20) {
      return NextResponse.json(
        { error: "Porciones inválidas (1 a 20)." },
        { status: 400 },
      );
    }
    if (
      !Number.isFinite(budgetArs) ||
      budgetArs < 1000 ||
      budgetArs > MAX_BUDGET_ARS
    ) {
      return NextResponse.json(
        { error: `Presupuesto inválido (1000 a ${MAX_BUDGET_ARS} ARS).` },
        { status: 400 },
      );
    }

    const { label, stores } = resolveStores(storeArg);
    const result = await runPlan({
      servings,
      budgetArs,
      stores,
      storeLabel: label,
      diet,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generando cena:", error);
    return NextResponse.json(
      { error: "No pudimos generar la cena. Probá de nuevo en unos minutos." },
      { status: 500 },
    );
  }
}
