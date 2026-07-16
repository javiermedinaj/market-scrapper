import { NextResponse } from "next/server";
import { loadAllProducts } from "@/lib/data";
import { filterByCategory } from "@/lib/analytics";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const products = await loadAllProducts();

  const filtered = filterByCategory(products, decodedCategory);
  const sorted = filtered.sort((a, b) => a.price - b.price);
  const cheapest = sorted.slice(0, 10);

  return NextResponse.json({
    category: decodedCategory,
    total: filtered.length,
    cheapest,
  });
}
