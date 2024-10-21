import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function diaScraper() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        await page.goto("https://diaonline.supermercadosdia.com.ar/especial-ofertas", { timeout: 120000 });
        const products = [];
        const extractProducts = async () => {
            const productsData = await page.evaluate(() => {
                const productElements = document.querySelectorAll(".vtex-slider-layout-0-x-slide.vtex-slider-layout-0-x-slide--destacado_ofertas.vtex-slider-layout-0-x-slide--visible.vtex-slider-layout-0-x-slide--destacado_ofertas--visible.flex.relative");
                const productsData = [];
                productElements.forEach((element) => {
                    const nameElement = element.querySelector(".vtex-product-summary-2-x-productBrand.vtex-product-summary-2-x-brandName.t-body");
                    const priceContainer = element.querySelector(".vtex-product-price-1-x-sellingPriceValue .vtex-product-price-1-x-currencyContainer");
                    const linkElement = element.querySelector("a.vtex-product-summary-2-x-clearLink.vtex-product-summary-2-x-clearLink--shelf.vtex-product-summary-2-x-clearLink--shelf_carrucel_landing.h-100.flex.flex-column");
                    const imageElement = element.querySelector(".vtex-product-summary-2-x-imageNormal.vtex-product-summary-2-x-image");
                    const name = nameElement ? nameElement.innerText.trim() : "Nombre no encontrado";
                    let price = "Precio no encontrado";
                    if (priceContainer) {
                        const currencyCode = priceContainer.querySelector(".vtex-product-price-1-x-currencyCode")?.innerText.trim() || "";
                        const currencyInteger = priceContainer.querySelectorAll(".vtex-product-price-1-x-currencyInteger");
                        const currencyGroup = priceContainer.querySelector(".vtex-product-price-1-x-currencyGroup")?.innerText.trim() || "";
                        const currencyDecimal = priceContainer.querySelector(".vtex-product-price-1-x-currencyDecimal")?.innerText.trim() || "";
                        const currencyFraction = priceContainer.querySelector(".vtex-product-price-1-x-currencyFraction")?.innerText.trim() || "";
                        price = `${currencyCode} ${Array.from(currencyInteger).map(el => el.innerText.trim()).join("")}${currencyGroup}${currencyDecimal}${currencyFraction}`;
                    }
                    const link = linkElement ? `https://diaonline.supermercadosdia.com.ar${linkElement.getAttribute("href")}` : null;
                    const image = imageElement ? imageElement.getAttribute("src") : "Imagen no encontrada";
                    productsData.push({ name, price, link, image });
                });
                return productsData;
            });
            return productsData;
        };
        const delay = (time) => new Promise(resolve => setTimeout(resolve, time));
        const initialProducts = await extractProducts();
        products.push(...initialProducts);
        await delay(30000);
        const dataDir = path.join(__dirname, '..', 'data');
        console.log(`Creando carpeta en: ${dataDir}`);
        await fs.mkdir(dataDir, { recursive: true });
        const filePath = path.join(dataDir, 'dia-ofertas.json');
        console.log(`Guardando archivo en: ${filePath}`);
        await fs.writeFile(filePath, JSON.stringify(products, null, 2));
        console.log("Productos guardados correctamente en dia-ofertas.json");
    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        await browser.close();
    }
}



export default diaScraper;
