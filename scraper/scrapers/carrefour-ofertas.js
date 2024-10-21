import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

            imageElements.forEach((element) => {
                const src = element.getAttribute("src");
                if (src) {
                    imageUrls.push({ image: `https://www.carrefour.com.ar${src}` });
                }
            });

            return imageUrls;
        });

        console.log(images);

        const dataDir = path.join(__dirname, '..', 'data');
        console.log(`Creando carpeta en: ${dataDir}`);
        await fs.mkdir(dataDir, { recursive: true });

        const filePath = path.join(dataDir, 'carrefour-ofertas.json');
        console.log(`Guardando archivo en: ${filePath}`);
        await fs.writeFile(filePath, JSON.stringify(images, null, 2));

        console.log("Imágenes guardadas correctamente en carrefour-ofertas.json");

        await browser.close();
    } catch (error) {
        console.error("Error occurred:", error);
        await browser.close();
    }
}



export default carrefourScraper;