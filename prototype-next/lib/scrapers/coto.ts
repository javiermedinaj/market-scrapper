import puppeteer from "puppeteer";
import { Product, StoreData } from "@/types";
import { saveStoreData } from "./base";

export async function scrapeCoto(): Promise<StoreData> {
  const storeName = "Coto";
  const storeSlug = "coto";
  const products: Product[] = [];
  const scrapedAt = new Date().toISOString();

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://www.coto.com.ar/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await page.waitForSelector(".swiper-slide img", { timeout: 20000 });

    const images = await page.evaluate(() => {
      const elements = document.querySelectorAll(".swiper-slide img");
      return Array.from(elements)
        .map((img) => img.getAttribute("src"))
        .filter(Boolean) as string[];
    });

    const uniqueImages = Array.from(new Set(images))
      .map((src) => {
        try {
          return src.startsWith("http") ? src : new URL(src, "https://www.coto.com.ar").href;
        } catch {
          console.error(`URL inválida encontrada: ${src}`);
          return null;
        }
      })
      .filter(
        (url): url is string =>
          url !== null && (url.includes("/ofertas/") || url.includes("/catalogos/"))
      )
      .map((url, index) => ({
        name: `Oferta Coto ${index + 1}`,
        image: url,
        link: "https://www.coto.com.ar/ofertas",
      }));

    console.log(`✅ Coto: ${uniqueImages.length} imágenes únicas`);

    for (const img of uniqueImages) {
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
    console.error("❌ Coto error:", error);
  } finally {
    await browser.close();
  }

  return saveStoreData(products, storeName, storeSlug);
}

export default scrapeCoto;
