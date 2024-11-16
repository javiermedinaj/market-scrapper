import puppeteer from "puppeteer";
import { platform } from 'os';

async function searchCarrefourProduct(productName) {
    const isWindows = platform() === 'win32';
    const defaultChromePath = isWindows 
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/usr/bin/google-chrome';

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
        executablePath: process.env.CHROME_PATH || defaultChromePath,
        timeout: 0
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });

        const searchUrl = `https://www.carrefour.com.ar/${productName}?_q=${productName}&map=ft&order=OrderByPriceASC`;
        await page.goto(searchUrl, { 
            timeout: 40000,
            waitUntil: ['networkidle0', 'domcontentloaded']
        });
    
        await page.waitForSelector(".vtex-product-summary-2-x-container", { timeout: 60000 });
        
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll(".vtex-product-summary-2-x-container");
            const productsData = [];
            
            const limit = Math.min(productElements.length, 5);
            
            for(let i = 0; i < limit; i++) {
                const element = productElements[i];
                const nameElement = element.querySelector(".vtex-product-summary-2-x-productBrand");
                const priceElement = element.querySelector(".valtech-carrefourar-product-price-0-x-currencyContainer");
                const linkElement = element.closest('.vtex-product-summary-2-x-clearLink');
                const imageElement = element.querySelector(".vtex-product-summary-2-x-image");
                
                productsData.push({
                    name: nameElement ? nameElement.innerText.trim() : "Nombre no encontrado",
                    price: priceElement ? priceElement.innerText.trim() : "Precio no encontrado",
                    link: linkElement ? linkElement.href : "Link no encontrado",
                    image: imageElement ? imageElement.src : "Imagen no encontrada"
                });
            }
            
            return productsData;
        });

        console.log(`Búsqueda completada. Encontrados ${products.length} productos`);
        return products;
    } catch (error) {
        console.error("Error durante la búsqueda:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

export default searchCarrefourProduct;