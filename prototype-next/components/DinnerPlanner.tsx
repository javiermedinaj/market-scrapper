"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ChefHat,
  ExternalLink,
  Loader2,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import type { PlanResult } from "@/lib/ai/types";

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const STORES = [
  { value: "both", label: "Día + Jumbo" },
  { value: "dia", label: "Día" },
  { value: "jumbo", label: "Jumbo" },
];

const DIETS = [
  { value: "omnivore", label: "Omnívora" },
  { value: "vegetarian", label: "Vegetariana" },
  { value: "vegan", label: "Vegana" },
];

export default function DinnerPlanner() {
  const [servings, setServings] = useState(2);
  const [budgetArs, setBudgetArs] = useState(20000);
  const [store, setStore] = useState("both");
  const [diet, setDiet] = useState("omnivore");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlanResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/dinner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ servings, budgetArs, store, diet }),
      });
      const payload = (await response.json()) as PlanResult | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Error inesperado");
      }
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-300">
          <Sparkles className="size-3.5" />
          Cena con IA
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          ¿Qué cocinamos hoy?
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-400">
          Elegí porciones, presupuesto, supermercado y dieta. La IA elige
          productos reales del catálogo y el código calcula el total.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-white/8 bg-zinc-900/80 p-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Porciones
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={servings}
            onChange={(event) => setServings(Number(event.target.value))}
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-red-400/60"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Presupuesto (ARS)
          </span>
          <input
            type="number"
            min={1000}
            step={1000}
            value={budgetArs}
            onChange={(event) => setBudgetArs(Number(event.target.value))}
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-red-400/60"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Supermercado
          </span>
          <select
            value={store}
            onChange={(event) => setStore(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-red-400/60"
          >
            {STORES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Dieta
          </span>
          <select
            value={diet}
            onChange={(event) => setDiet(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-red-400/60"
          >
            {DIETS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Pensando…
            </>
          ) : (
            <>
              <ChefHat className="size-4" />
              Generar cena
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="rounded-2xl border border-white/8 bg-zinc-900/60 p-5 text-sm text-zinc-400">
          Buscando productos y armando la receta. Puede tardar unos segundos.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 size-4 flex-none" />
          {error}
        </div>
      )}

      {result && <DinnerResult result={result} budgetArs={budgetArs} />}
    </div>
  );
}

function DinnerResult({
  result,
  budgetArs,
}: {
  result: PlanResult;
  budgetArs: number;
}) {
  const { recipe, ingredients } = result;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/8 bg-zinc-900/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {recipe.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {recipe.servings} porciones · {result.storeLabel} · dieta{" "}
              {result.diet === "vegan"
                ? "vegana"
                : result.diet === "vegetarian"
                  ? "vegetariana"
                  : "omnívora"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Total calculado
            </p>
            <p
              className={`text-2xl font-black ${
                result.overBudget ? "text-red-300" : "text-emerald-300"
              }`}
            >
              {ars.format(result.total)}
            </p>
            <p className="text-xs text-zinc-500">
              presupuesto {ars.format(budgetArs)}
            </p>
          </div>
        </div>

        {(result.stale ||
          result.semanticWarnings.length > 0 ||
          result.dietViolations.length > 0) && (
          <div className="mt-4 space-y-2">
            {result.stale && (
              <Warning>
                Precios con {result.priceAgeDays} días de antigüedad (último
                scrape: {result.newestScrapedAt ?? "—"}). Verificá antes de
                comprar.
              </Warning>
            )}
            {result.semanticWarnings.length > 0 && (
              <Warning>
                Producto dudoso: {result.semanticWarnings.join("; ")}
              </Warning>
            )}
            {result.dietViolations.length > 0 && (
              <Warning>
                No cumple la dieta: {result.dietViolations.join("; ")}
              </Warning>
            )}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/80">
        <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
          <ShoppingBasket className="size-4 text-red-300" />
          <h3 className="text-sm font-bold text-white">Lista de compras</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-3 font-bold">Producto</th>
                <th className="px-3 py-3 text-right font-bold">Cantidad</th>
                <th className="px-3 py-3 font-bold">Unidad</th>
                <th className="px-5 py-3 text-right font-bold">Costo</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr
                  key={`${ingredient.productId}-${ingredient.name}`}
                  className="border-t border-white/5 align-top"
                >
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      {ingredient.image ? (
                        <img
                          src={ingredient.image}
                          alt=""
                          className="size-12 flex-none rounded-lg border border-white/10 bg-white object-contain p-1"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="size-12 flex-none rounded-lg border border-white/10 bg-black" />
                      )}
                      <div>
                        <p className="font-semibold text-zinc-100">
                          {ingredient.name}
                        </p>
                        {ingredient.productName &&
                          (ingredient.link ? (
                            <a
                              href={ingredient.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-red-300 hover:underline"
                            >
                              {ingredient.productName}
                              <ExternalLink className="size-3" />
                            </a>
                          ) : (
                            <p className="text-xs text-zinc-400">
                              {ingredient.productName}
                            </p>
                          ))}
                        <p className="text-[11px] text-zinc-500">
                          {ingredient.store}
                          {ingredient.pantry ? " · despensa" : ""}
                          {ingredient.scrapedAt
                            ? ` · ${String(ingredient.scrapedAt).slice(0, 10)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-zinc-300">
                    {ingredient.quantity}
                  </td>
                  <td className="px-3 py-3 text-zinc-400">
                    {ingredient.unit}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-emerald-300">
                    {ingredient.cost == null
                      ? "—"
                      : ingredient.cost === 0
                        ? "despensa"
                        : ars.format(ingredient.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-white/8 bg-zinc-900/80 p-6">
        <h3 className="text-sm font-bold text-white">Preparación</h3>
        <ol className="mt-3 space-y-3">
          {recipe.steps.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm leading-6 text-zinc-300">
              <span className="flex size-6 flex-none items-center justify-center rounded-full bg-red-500/15 text-xs font-bold text-red-300">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

    </div>
  );
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
      <AlertTriangle className="mt-0.5 size-3.5 flex-none" />
      {children}
    </div>
  );
}
