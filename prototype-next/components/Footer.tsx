import { CirclePercent } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/8 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-9 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
        <div className="inline-flex items-center justify-center gap-2 sm:justify-start"><CirclePercent className="size-5 text-red-400" /><span className="font-black">Ofertas<span className="text-red-400">BA</span></span></div>
        <p className="text-sm text-zinc-500">Compará precios, elegí mejor.</p>
        <p className="text-xs text-zinc-600">Precios sujetos a cambios en cada tienda.</p>
      </div>
    </footer>
  );
}
