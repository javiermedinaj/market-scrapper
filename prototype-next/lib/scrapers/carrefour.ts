import puppeteer from "puppeteer";
import { Product, StoreData } from "@/types";
import { saveStoreData } from "./base";

export async function scrapeCarrefour(): Promise<StoreData> {
  const storeName = "Carrefour";
  const storeSlug = "carrefour";
  const products: Product[] = [];
  const scrapedAt = new Date().toISOString();

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://www.carrefour.com.ar/promociones", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const images = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        ".valtech-carrefourar-offline-promotions-0-x-cardBody img"
      );
      return Array.from(elements)
        .map((element, index) => {
          const src = element.getAttribute("src");
          return src
            ? {
                name: `Promoción Carrefour ${index + 1}`,
                image: src.startsWith("http") ? src : `https://www.carrefour.com.ar${src}`,
                link: "https://www.carrefour.com.ar/promociones",
              }
            : null;
        })
        .filter(Boolean);
    });

    console.log(`✅ Carrefour: Obtenidas ${images.length} promociones`);

    for (const img of images) {
      if (!img) continue;
      products.push({
        name: img.name,
        price: 0,
        link: img.link,
        image: img.image,
        scrapedAt,
        store: storeName,
      });
    }
  } catch (error) {
    console.error("❌ Carrefour error:", error);
  } finally {
    await browser.close();
  }

  return saveStoreData(products, storeName, storeSlug);
}

export default scrapeCarrefour;
