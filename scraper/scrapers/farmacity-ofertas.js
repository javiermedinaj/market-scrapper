import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { saveDataWithDate } from '../utils/dateStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function extractProducts(page) {
    return await page.evaluate(() => {
        const productElements = document.querySelectorAll("section.vtex-product-summary-2-x-container");
        const productsData = [];

        productElements.forEach(element => {
            const nameElement = element.querySelector("h2.vtex-product-summary-2-x-productNameContainer span.vtex-product-summary-2-x-productBrand");
            const priceContainer = element.querySelector(".vtex-product-price-1-x-sellingPriceValue .vtex-product-price-1-x-currencyContainer");
            const linkElement = element.querySelector("a.vtex-product-summary-2-x-clearLink");
            const imageElement = element.querySelector("img.vtex-product-summary-2-x-imageNormal");

            if (nameElement && priceContainer && linkElement && imageElement) {
                let price = "Precio no encontrado";
                const currencyCode = priceContainer.querySelector(".vtex-product-price-1-x-currencyCode")?.innerText.trim() || "";
                const currencyIntegers = Array.from(priceContainer.querySelectorAll(".vtex-product-price-1-x-currencyInteger"))
                    .map(el => el.innerText.trim()).join("");
                const currencyGroup = priceContainer.querySelector(".vtex-product-price-1-x-currencyGroup")?.innerText.trim() || "";
                const currencyDecimal = priceContainer.querySelector(".vtex-product-price-1-x-currencyDecimal")?.innerText.trim() || "";
                const currencyFraction = priceContainer.querySelector(".vtex-product-price-1-x-currencyFraction")?.innerText.trim() || "";
                price = `${currencyCode} ${currencyIntegers}${currencyGroup}${currencyDecimal}${currencyFraction}`;

                const link = `https://www.farmacity.com${linkElement.getAttribute("href")}`;
                let imageSrc = imageElement.getAttribute("src");
                if (imageSrc && !imageSrc.startsWith('http')) {
                    imageSrc = `https://www.farmacity.com${imageSrc.startsWith('/') ? '' : '/'}${imageSrc}`;
                }

                productsData.push({
                    name: nameElement.innerText.trim(),
                    price: price,
                    link: link,
                    image: imageSrc
                });
            }
        });

        return productsData;
    });
}

async function farmacityScraper() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    try {
        const page = await browser.newPage();
        let allProducts = [];

        // Cargar solo la primera página con scroll para obtener más productos
        const url = `https://www.farmacity.com/2246?map=productClusterIds&order=OrderByTopSaleDESC`;
        await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
        console.log(`Página cargada.`);

        try {
            await page.waitForSelector("section.vtex-product-summary-2-x-container", { timeout: 15000 });
            console.log(`Contenedores de productos encontrados.`);
            
            // Scroll para cargar más productos (lazy loading)
            console.log('📜 Cargando todos los productos con scroll...');
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

            const products = await extractProducts(page);
            console.log(`✅ Encontrados ${products.length} productos en total.`);
            allProducts = products;
        } catch (error) {
            console.log(`⚠️ Error cargando productos: ${error.message}`);
        }

        const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.link, item])).values());

        const dataDir = path.join(__dirname, '..', 'data');
        await saveDataWithDate(uniqueProducts, 'farmacity', dataDir);

        console.log("✅ Productos de Farmacity guardados correctamente por día");
    } catch (error) {
        console.error("Error ocurrido:", error);
    } finally {
        await browser.close();
    }
}

export default farmacityScraper;