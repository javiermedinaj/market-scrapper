import { NextResponse } from "next/server";
import { loadAllProducts } from "@/lib/data";
import { searchProducts } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  const products = await loadAllProducts();
  const results = searchProducts(products, query);

  return NextResponse.json({
    query,
    count: results.length,
    data: results,
  });
}
