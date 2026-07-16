"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, MapPin, Search, Sparkles, X } from "lucide-react";
import { Product } from "@/types";

const INITIAL_RESULTS = 3;
const SUGGESTIONS = ["Palta", "Yerba", "Leche", "Pañales", "Shampoo"];
type SortOption = "relevance" | "price-asc" | "price-desc";

const STORES = [
  { id: "Día", name: "Día", dot: "bg-rose-400", badge: "bg-rose-400/10 text-rose-300 ring-rose-400/20" },
  { id: "Jumbo", name: "Jumbo", dot: "bg-emerald-400", badge: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20" },
  { id: "Farmacity", name: "Farmacity", dot: "bg-violet-400", badge: "bg-violet-400/10 text-violet-300 ring-violet-400/20" },
  { id: "FarmaOnline", name: "FarmaOnline", dot: "bg-amber-400", badge: "bg-amber-400/10 text-amber-300 ring-amber-400/20" },
];

const formatPrice = (price: number) => `$${price.toLocaleString("es-AR")}`;

export default function Searcher() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [visible, setVisible] = useState<Record<string, number>>(() =>
    Object.fromEntries(STORES.map((store) => [store.id, INITIAL_RESULTS]))
  );

  const resetVisible = () =>
    setVisible(Object.fromEntries(STORES.map((store) => [store.id, INITIAL_RESULTS])));

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    resetVisible();
  };

  const search = async (term: string) => {
    const trimmedQuery = term.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setResults([]);
    setHasSearched(false);
    resetVisible();

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      setResults(Array.isArray(data) ? data : data?.data || []);
      setHasSearched(true);
    } catch (error) {
      console.error("Error buscando:", error);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    void search(query);
  };

  const sortProducts = (products: Product[]) => {
    if (sortBy === "price-asc") return [...products].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") return [...products].sort((a, b) => b.price - a.price);
    return products;
  };

  const groupedResults = STORES.map((store) => ({
    ...store,
    items: sortProducts(results.filter((product) => product.store === store.id)),
  })).filter((store) => store.items.length > 0);

  return (
    <section className="bg-black text-white">
      <div className="relative isolate overflow-hidden border-b border-white/8 bg-zinc-950 px-4 py-12 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(239,68,68,0.25),transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
            <Sparkles className="size-3.5" /> Comparador de precios
          </div>
          <h1 className="text-balance text-4xl font-black tracking-[-0.045em] sm:text-5xl md:text-6xl">
            Compará precios antes de comprar.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-zinc-400 sm:text-lg">
            Encontrá en segundos dónde conviene comprar tus productos en Buenos Aires.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <form onSubmit={handleSearch} className="rounded-2xl border border-white/10 bg-zinc-900/80 p-1.5 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex items-center gap-2">
                <Search className="ml-3 size-5 shrink-0 text-zinc-500" aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent py-3 text-base text-white outline-none placeholder:text-zinc-500"
                  placeholder="Ej. palta, yerba, pañales…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Producto a buscar"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 disabled:cursor-wait disabled:opacity-60"
                >
                  {loading ? "Buscando…" : "Comparar"}
                </button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-zinc-500">Probá con:</span>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    void search(suggestion);
                  }}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
              <MapPin className="size-3.5" /> Buenos Aires, Argentina
            </p>
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">Resultados para “{query}”</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">{results.length} productos encontrados</h2>
                {results.length > 0 && <p className="mt-1 text-sm text-zinc-500">{groupedResults.length} tiendas con resultados · Ordená para explorar mejor</p>}
              </div>
              <button onClick={clearSearch} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-white">
                <X className="size-4" /> Limpiar búsqueda
              </button>
            </div>

            {results.length > 0 ? (
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/8 bg-zinc-900/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-5 text-zinc-400">Los precios corresponden a productos que coinciden con tu búsqueda. Compará presentación, tamaño y marca antes de elegir.</p>
                <div className="flex shrink-0 rounded-xl bg-black/30 p-1" role="group" aria-label="Ordenar resultados">
                  {([
                    ["relevance", "Relevancia"],
                    ["price-asc", "Menor precio"],
                    ["price-desc", "Mayor precio"],
                  ] as const).map(([option, label]) => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`min-h-9 rounded-lg px-3 text-xs font-bold transition ${sortBy === option ? "bg-red-500 text-white shadow" : "text-zinc-400 hover:text-white"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 py-12 text-center text-zinc-400">
                No encontramos “{query}”. Probá con un término más general.
              </div>
            )}

            {groupedResults.length > 0 && (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {groupedResults.map((store) => {
                  const displayed = store.items.slice(0, visible[store.id]);
                  return (
                    <section key={store.id}>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-bold"><span className={`size-2.5 rounded-full ${store.dot}`} />{store.name}</h3>
                        <span className="text-xs text-zinc-500">{store.items.length} resultados</span>
                      </div>
                      <div className="space-y-2">
                        {displayed.map((product) => {
                          return (
                            <a key={`${product.store}-${product.productId || product.link}`} href={product.link} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl border border-white/8 bg-zinc-900/70 p-2.5 transition hover:border-red-400/40 hover:bg-zinc-900">
                              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                                {product.image ? <img src={product.image} alt="" className="size-full object-contain p-1" loading="lazy" /> : <Search className="size-5 text-zinc-400" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${store.badge}`}>{store.name}</span>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-bold text-emerald-300">{formatPrice(product.price)}</p>
                                <ArrowUpRight className="ml-auto mt-1 size-4 text-zinc-500 transition group-hover:text-red-300" />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                      {store.items.length > visible[store.id] && (
                        <button onClick={() => setVisible((current) => ({ ...current, [store.id]: Math.min(store.items.length, current[store.id] + INITIAL_RESULTS) }))} className="mt-3 w-full rounded-xl border border-white/10 py-2 text-sm font-semibold text-zinc-300 transition hover:border-red-400/40 hover:text-white">
                          Ver {Math.min(INITIAL_RESULTS, store.items.length - visible[store.id])} más en {store.name}
                        </button>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
