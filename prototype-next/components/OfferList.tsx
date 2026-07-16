"use client";

import { useState } from "react";
import { Calendar, PackageSearch, Store, TrendingUp } from "lucide-react";
import { Product } from "@/types";
import OfferCard from "./OfferCard";

interface StoreInfo { id: string; name: string; }

const STORES: StoreInfo[] = [
  { id: "jumbo", name: "Jumbo" },
  { id: "farmacity", name: "Farmacity" },
  { id: "dia", name: "Día" },
  { id: "farma", name: "FarmaOnline" },
  { id: "carrefour", name: "Carrefour" },
  { id: "coto", name: "Coto" },
];
const ITEMS_PER_PAGE = 12;

interface OfferListProps { initialData: Record<string, Product[]>; }

export default function OfferList({ initialData }: OfferListProps) {
  const [activeStore, setActiveStore] = useState("all");
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const availableStores = STORES.filter((store) => (initialData[store.id] || []).length > 0);
  const totalProducts = availableStores.reduce((sum, store) => sum + (initialData[store.id] || []).length, 0);
  const filteredProducts = activeStore === "all"
    ? availableStores.flatMap((store) => (initialData[store.id] || []).map((product) => ({ ...product, storeId: store.id })))
    : (initialData[activeStore] || []).map((product) => ({ ...product, storeId: activeStore }));
  const displayedProducts = filteredProducts.slice(0, displayedCount);
  const hasMore = filteredProducts.length > displayedCount;

  const selectStore = (storeId: string) => { setActiveStore(storeId); setDisplayedCount(ITEMS_PER_PAGE); };

  return (
    <section className="py-10 sm:py-14" aria-labelledby="offers-heading">
      <div className="rounded-2xl border border-white/8 bg-zinc-950 p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">Precios para mirar hoy</p>
            <h2 id="offers-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Ofertas disponibles</h2>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-1.5"><PackageSearch className="size-4 text-red-300" />{totalProducts.toLocaleString("es-AR")} productos</span>
            <span className="inline-flex items-center gap-1.5"><Store className="size-4 text-red-300" />{availableStores.length} tiendas con datos</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="size-4 text-red-300" />Actualizado hoy</span>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/8 bg-zinc-950 p-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-1">
          <button onClick={() => selectStore("all")} className={`min-h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition ${activeStore === "all" ? "bg-red-500 text-white shadow-lg shadow-red-950/40" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}>Todos <span className="ml-1 text-xs opacity-75">{totalProducts.toLocaleString("es-AR")}</span></button>
          {availableStores.map((store) => {
            const count = initialData[store.id].length;
            return <button key={store.id} onClick={() => selectStore(store.id)} className={`min-h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition ${activeStore === store.id ? "bg-red-500 text-white shadow-lg shadow-red-950/40" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}>{store.name} <span className="ml-1 text-xs opacity-75">{count.toLocaleString("es-AR")}</span></button>;
          })}
        </div>
      </div>

      {displayedProducts.length > 0 ? (
        <>
          <div className="mt-6 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedProducts.map((product, index) => <OfferCard key={`${product.storeId}-${product.productId || index}`} product={product} storeName={STORES.find((store) => store.id === product.storeId)?.name} />)}
          </div>
          {hasMore && <div className="mt-8 flex justify-center"><button onClick={() => setDisplayedCount((count) => count + ITEMS_PER_PAGE)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-5 text-sm font-bold text-red-100 transition hover:bg-red-500 hover:text-white"><TrendingUp className="size-4" />Cargar {Math.min(ITEMS_PER_PAGE, filteredProducts.length - displayedCount)} más</button></div>}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 py-16 text-center"><Store className="mx-auto size-10 text-zinc-600" /><h3 className="mt-4 font-bold">No hay ofertas disponibles</h3><p className="mt-1 text-sm text-zinc-500">Volvé a intentar cuando tengamos precios actualizados.</p></div>
      )}
    </section>
  );
}
