import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function cotoScraper() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    try {
        const page = await browser.newPage();
        await page.goto("https://www.coto.com.ar/", { timeout: 120000, waitUntil: 'networkidle2' });

        await page.waitForSelector(".swiper-slide img", { timeout: 60000 });

        const images = await page.evaluate(() => {
            const imageElements = document.querySelectorAll(".swiper-slide img");
            const imageUrls = [];

            imageElements.forEach((img) => {
                let src = img.getAttribute("src");
                if (src) {
                    imageUrls.push(src);
                }
            });

            return imageUrls;
        });

        console.log(`Encontradas ${images.length} imágenes de ofertas y catalogos.`);
        
        const uniqueImages = Array.from(new Set(images))
            .map(src => {
                try {
                    return src.startsWith('http') ? src : new URL(src, 'https://www.coto.com.ar').href;
                } catch (error) {
                    console.error(`URL inválida encontrada: ${src}`);
                    return null;
                }
            })
            .filter(url => url !== null) 
            .filter(url => url.includes('/ofertas/') || url.includes('/catalogos/')) 
            .map(url => ({ image: url }));

        console.log(`Imágenes únicas después de la corrección y filtrado: ${uniqueImages.length}`);
        const dataDir = path.join(__dirname, '..', 'data');
        console.log(`Creando carpeta en: ${dataDir}`);
        await fs.mkdir(dataDir, { recursive: true });

        const filePath = path.join(dataDir, 'coto-ofertas.json');
        console.log(`Guardando archivo en: ${filePath}`);
        await fs.writeFile(filePath, JSON.stringify(uniqueImages, null, 2));

        console.log("Imágenes guardadas correctamente en coto-ofertas.json");

    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        await browser.close();
    }
}

cotoScraper();