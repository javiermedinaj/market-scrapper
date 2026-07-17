import { Product } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Searcher from "@/components/Searcher";
import OfferList from "@/components/OfferList";
import { loadAllProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

const STORE_SLUGS = ["dia", "jumbo", "farmacity", "farma"] as const;

function groupByStore(products: Product[]): Record<string, Product[]> {
  const map: Record<string, Product[]> = {};
  for (const slug of STORE_SLUGS) map[slug] = [];
  for (const p of products) {
    const key = (p.store || "").toLowerCase();
    if (map[key]) map[key].push(p);
  }
  return map;
}

export default async function Home() {
  const allProducts = await loadAllProducts();
  const initialData = groupByStore(allProducts);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main id="top">
        <Searcher />
        <div className="max-w-7xl mx-auto px-4">
          <OfferList initialData={initialData} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
