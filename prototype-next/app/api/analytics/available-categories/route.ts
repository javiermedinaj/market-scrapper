import { NextResponse } from "next/server";
import { loadAllProducts } from "@/lib/data";

export async function GET() {
  const products = await loadAllProducts();
  const categorySet = new Set<string>();

  for (const p of products) {
    if (p.category) categorySet.add(p.category);
  }

  const categories = Array.from(categorySet).sort();

  return NextResponse.json({
    categories,
    total: categories.length,
  });
}
