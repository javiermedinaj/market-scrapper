import { NextResponse } from "next/server";
import { loadAllProducts } from "@/lib/data";
import { getStoreStats, filterByStoreType } from "@/lib/analytics";

export async function GET() {
  const products = await loadAllProducts();

  return NextResponse.json({
    supermarkets: {
      totalProducts: filterByStoreType(products, true).length,
      stores: {
        Día: getStoreStats(products, "Día"),
        Jumbo: getStoreStats(products, "Jumbo"),
      },
    },
    pharmacies: {
      totalProducts: filterByStoreType(products, false).length,
      stores: {
        Farmacity: getStoreStats(products, "Farmacity"),
        FarmaOnline: getStoreStats(products, "FarmaOnline"),
      },
    },
  });
}
