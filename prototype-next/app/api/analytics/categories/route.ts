import { NextResponse } from "next/server";
import { loadAllProducts } from "@/lib/data";
import { calculateCategoryStats } from "@/lib/analytics";

export async function GET() {
  const products = await loadAllProducts();
  const stats = calculateCategoryStats(products);

  return NextResponse.json(stats);
}
