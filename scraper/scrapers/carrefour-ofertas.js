import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { saveDataWithDate } from '../utils/dateStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function carrefourScraper() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    try {
        const page = await browser.newPage();
        await page.goto("https://www.carrefour.com.ar/promociones");

        const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

        await delay(10000);

        const images = await page.evaluate(() => {
            const imageElements = document.querySelectorAll(".valtech-carrefourar-offline-promotions-0-x-cardBody img");
            const imageUrls = [];

            imageElements.forEach((element, index) => {
                const src = element.getAttribute("src");
                if (src) {
                    imageUrls.push({ 
                        name: `Promoción Carrefour ${index + 1}`,
                        image: `https://www.carrefour.com.ar${src}`,
                        price: "Ver en tienda",
                        link: "https://www.carrefour.com.ar/promociones"
                    });
                }
            });

            return imageUrls;
        });

        console.log(`✅ Obtenidas ${images.length} promociones de Carrefour`);

        const dataDir = path.join(__dirname, '..', 'data');
        console.log(`Creando carpeta en: ${dataDir}`);
        await saveDataWithDate(images, 'carrefour', dataDir);

        console.log("✅ Productos de Carrefour guardados correctamente por día");

        await browser.close();
    } catch (error) {
        console.error("Error occurred:", error);
        await browser.close();
    }
}

carrefourScraper()

export default carrefourScraper;