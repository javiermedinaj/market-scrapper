import { Product } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Searcher from "@/components/Searcher";
import OfferList from "@/components/OfferList";
import { loadTodayStoreData } from "@/lib/data";

const STORE_SLUGS = ["dia", "jumbo", "farmacity", "farma", "carrefour", "coto"];

export default async function Home() {
  const storeData = await Promise.all(
    STORE_SLUGS.map(async (slug) => {
      const data = await loadTodayStoreData(slug);
      return [slug, data?.data || []] as const;
    })
  );
  const initialData: Record<string, Product[]> = Object.fromEntries(storeData);

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
