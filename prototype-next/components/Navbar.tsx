import { CirclePercent, MapPin } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-3" aria-label="Ir al inicio de OfertasBA">
          <span className="flex size-9 items-center justify-center rounded-xl bg-red-500 shadow-lg shadow-red-950/50"><CirclePercent className="size-5 text-white" /></span>
          <span><strong className="block text-base font-black tracking-tight text-white">Ofertas<span className="text-red-400">BA</span></strong><span className="block text-[10px] font-medium text-zinc-500">Comparador de precios</span></span>
        </a>
        <span className="hidden items-center gap-1.5 text-xs font-medium text-zinc-400 sm:inline-flex"><MapPin className="size-3.5 text-red-300" />Buenos Aires</span>
      </div>
    </nav>
  );
}
