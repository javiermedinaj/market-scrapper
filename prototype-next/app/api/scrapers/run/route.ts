import { NextResponse } from "next/server";
import { runScraper, ScraperName } from "@/lib/scrapers";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.SCRAPER_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const scraper = (body.scraper || "all") as ScraperName;

    const results = await runScraper(scraper);

    return NextResponse.json({
      success: true,
      scraper,
      results: results.map((r) => ({
        store: r.store,
        totalProducts: r.totalProducts,
        date: r.date,
      })),
    });
  } catch (error) {
    console.error("❌ Error running scraper:", error);
    return NextResponse.json(
      { error: "Failed to run scraper", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
