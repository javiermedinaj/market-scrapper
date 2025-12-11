import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { saveDataWithDate } from '../utils/dateStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function farmaScraper() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        await page.goto("https://www.farmaonline.com/ofertas-home", { timeout: 20000 });

        console.log('⏳ Esperando productos...');
        await page.waitForSelector(".vtex-product-summary-2-x-container", { timeout: 15000 });
        
        // Scroll para cargar productos lazy loading
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
            }, 150);
          });
        });
        
        await delay(2000);

        const allProducts = await page.evaluate(() => {
            const productElements = document.querySelectorAll(".vtex-product-summary-2-x-container");
            const products = [];

            productElements.forEach((element) => {
                const nameElement = element.querySelector(".vtex-product-summary-2-x-productBrand");
                const priceContainer = element.querySelector(".vtex-product-price-1-x-sellingPriceValue");
                const linkElement = element.querySelector("a.vtex-product-summary-2-x-clearLink");
                const imageElement = element.querySelector(".vtex-product-summary-2-x-imageNormal");
                const promoElement = element.querySelector(".farmaonline-administrable-highlights-0-x-MasXmenosText");

        
                if (nameElement && priceContainer) {
                    let price = "Precio no encontrado";
                    if (priceContainer) {
                        const currencyCode = priceContainer.querySelector(".vtex-product-price-1-x-currencyCode")?.innerText.trim() || "";
                        const currencyIntegers = Array.from(priceContainer.querySelectorAll(".vtex-product-price-1-x-currencyInteger"))
                            .map(el => el.innerText.trim())
                            .join("");
                        const currencyDecimal = priceContainer.querySelector(".vtex-product-price-1-x-currencyDecimal")?.innerText.trim() || "";
                        const currencyFraction = priceContainer.querySelector(".vtex-product-price-1-x-currencyFraction")?.innerText.trim() || "";
                        
                        price = `${currencyCode} ${currencyIntegers}${currencyDecimal}${currencyFraction}`;
                    }

                    products.push({
                        name: nameElement.innerText.trim(),
                        price: price,
                        link: linkElement ? `https://www.farmaonline.com${linkElement.getAttribute("href")}` : null,
                        image: imageElement ? imageElement.getAttribute("src") : null,
                        promo: promoElement ? promoElement.innerText.trim() : null
                    });
                }
            });
            return products;
        });
        
        console.log(`✅ Extraídos ${allProducts.length} productos de FarmaOnline`);
        const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.link, item])).values());
        
        const dataDir = path.join(__dirname, '..', 'data');
        await saveDataWithDate(uniqueProducts, 'farma', dataDir);

        console.log("✅ Productos de Farma guardados correctamente por día");

    } catch (error) {
        console.error("Error occurred:", error);
        throw error;
    } finally {
        await browser.close();
    }
}


export default farmaScraper;