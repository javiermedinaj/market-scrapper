import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { saveDataWithDate } from '../utils/dateStorage.js';

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
        await page.goto("https://www.coto.com.ar/", { timeout: 20000, waitUntil: 'networkidle2' });

        await page.waitForSelector(".swiper-slide img", { timeout: 20000 });

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
            .map((url, index) => ({ 
                name: `Oferta Coto ${index + 1}`,
                image: url,
                price: 'Ver en tienda',
                link: 'https://www.coto.com.ar/ofertas'
            }));

        console.log(`Imágenes únicas después de la corrección y filtrado: ${uniqueImages.length}`);
        const dataDir = path.join(__dirname, '..', 'data');
        console.log(`Creando carpeta en: ${dataDir}`);
        await saveDataWithDate(uniqueImages, 'coto', dataDir);

        console.log("✅ Productos de Coto guardados correctamente por día");

    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        await browser.close();
    }
}
//funcionm para testear
// cotoScraper()

export default cotoScraper;