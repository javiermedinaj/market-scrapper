import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { saveDataWithDate } from "../utils/dateStorage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function jumboScraper() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://www.jumbo.com.ar/55406?map=productClusterIds", {
      timeout: 20000,
    });

    console.log('⏳ Esperando productos...');
    await page.waitForSelector(".vtex-product-summary-2-x-container", { timeout: 15000 });
    
    console.log('📜 Cargando productos con scroll...');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          const scrollHeight = document.documentElement.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    
    const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
    await delay(2000);

    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(
        ".vtex-product-summary-2-x-container"
      );
      const productsData = [];

      productElements.forEach((element) => {
        const nameElement = element.querySelector(
          ".vtex-product-summary-2-x-nameContainer"
        );
        const priceElement = element.querySelector(
          ".jumboargentinaio-store-theme-1dCOMij_MzTzZOCohX1K7w"
        );
        const linkElement = element.querySelector(
          "a.vtex-product-summary-2-x-clearLink.h-100.flex.flex-column"
        );
        const imageElement = element.querySelector(
          ".vtex-product-summary-2-x-imageContainer img.vtex-product-summary-2-x-imageNormal.vtex-product-summary-2-x-image"
        );

        const name = nameElement
          ? nameElement.innerText.trim()
          : "Nombre no encontrado";
        const price = priceElement
          ? priceElement.innerText.trim()
          : "Precio no encontrado";
        const link = linkElement
          ? `https://www.jumbo.com.ar${linkElement.getAttribute("href")}`
          : "";
        const image = imageElement
          ? imageElement.getAttribute("src")
          : "Imagen no encontrada";

        if (name && price) {
          productsData.push({ name, price, link, image });
        }
      });

      return productsData;
    });
    
    console.log(`✅ Extraídos ${products.length} productos de Jumbo`);

    const uniqueProducts = Array.from(new Map(products.map(item => [item.link, item])).values());

    const dataDir = path.join(__dirname, "..", "data");
    console.log(`Directorio de datos: ${dataDir}`);

    await saveDataWithDate(uniqueProducts, "jumbo", dataDir);

    console.log("✅ Productos de Jumbo guardados correctamente por día");

    await browser.close();
  } catch (error) {
    console.error("Error occurred:", error);
    await browser.close();
  }
}

// jumboScraper()

export default jumboScraper;
