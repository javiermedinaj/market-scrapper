"use client";

import { ArrowUpRight, ShoppingCart, Store } from "lucide-react";
import { Product } from "@/types";

interface OfferCardProps {
  product: Product;
  storeName?: string;
}

const STORE_STYLES: Record<string, string> = {
  Jumbo: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  Carrefour: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
  Farmacity: "bg-violet-400/10 text-violet-300 ring-violet-400/20",
  "Día": "bg-rose-400/10 text-rose-300 ring-rose-400/20",
  FarmaOnline: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  Coto: "bg-yellow-400/10 text-yellow-300 ring-yellow-400/20",
};

const DEFAULT_STORE_LINKS: Record<string, string> = {
  Coto: "https://www.coto.com.ar/ofertas",
  Carrefour: "https://www.carrefour.com.ar/promociones",
  Jumbo: "https://www.jumbo.com.ar/ofertas",
  "Día": "https://diaonline.supermercadosdia.com.ar/especial-ofertas",
  Farmacity: "https://www.farmacity.com/promociones",
  FarmaOnline: "https://www.farmaonline.com/promociones",
};

export default function OfferCard({ product, storeName }: OfferCardProps) {
  const productName = product.name || (product.image ? "Oferta especial" : "Producto sin nombre");
  const productImage = product.image && product.image !== "Imagen no encontrada" ? product.image : null;
  const finalLink = product.link && product.link !== "https://" ? product.link : DEFAULT_STORE_LINKS[storeName || ""] || "#";
  const storeStyle = STORE_STYLES[storeName || ""] || "bg-zinc-400/10 text-zinc-300 ring-zinc-400/20";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/80 transition duration-300 hover:-translate-y-1 hover:border-red-400/40 hover:shadow-xl hover:shadow-black/30">
      <div className="relative aspect-[16/10] overflow-hidden bg-white">
        {productImage ? (
          <img src={productImage} alt={productName} className="size-full object-contain p-3 transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        ) : (
          <div className="flex size-full flex-col items-center justify-center bg-zinc-800 text-zinc-500"><ShoppingCart className="size-8" /><span className="mt-2 text-xs">Sin imagen</span></div>
        )}
        {storeName && <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 backdrop-blur ${storeStyle}`}><Store className="size-3" />{storeName}</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-zinc-100">{productName}</h3>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Precio relevado</p><p className="mt-1 text-xl font-black tracking-tight text-emerald-300">{product.price ? `$${product.price.toLocaleString("es-AR")}` : "Consultar"}</p></div>
        </div>
        <a href={finalLink} target="_blank" rel="noopener noreferrer" className={`mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${finalLink !== "#" ? "bg-red-500 text-white hover:bg-red-400" : "pointer-events-none bg-zinc-800 text-zinc-600"}`}>
          {finalLink !== "#" ? "Ver en tienda" : "No disponible"}<ArrowUpRight className="size-4" />
        </a>
      </div>
    </article>
  );
}
