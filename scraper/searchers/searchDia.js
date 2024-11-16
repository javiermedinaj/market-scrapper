import puppeteer from "puppeteer";
import { platform } from 'os';

async function searchDiaProduct(productName) {
    const isWindows = platform() === 'win32';
    const defaultChromePath = isWindows 
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/usr/bin/google-chrome';

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-features=site-per-process',
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',
            '--disable-features=BlockInsecurePrivateNetworkRequests'
        ],
        executablePath: process.env.CHROME_PATH || defaultChromePath,
        timeout: 0
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });

        const searchUrl = `https://diaonline.supermercadosdia.com.ar/${productName}?_q=${productName}&map=ft&order=OrderByPriceASC`;
        await page.goto(searchUrl, { 
            timeout: 120000,
            waitUntil: ['networkidle0', 'domcontentloaded']
          });
    
        await page.waitForSelector(".vtex-product-summary-2-x-container");
        
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll(".vtex-product-summary-2-x-container");
            const productsData = [];
            
            const limit = Math.min(productElements.length, 5);
            
            for(let i = 0; i < limit; i++) {
                const element = productElements[i];
                const nameElement = element.querySelector(".vtex-product-summary-2-x-productBrand");
                const priceElement = element.querySelector(".vtex-product-price-1-x-sellingPriceValue");
                const linkElement = element.querySelector("a.vtex-product-summary-2-x-clearLink");
                const imageElement = element.querySelector(".vtex-product-summary-2-x-image");
                
                const price = priceElement ? (() => {
                    const integers = priceElement.querySelectorAll('.vtex-product-price-1-x-currencyInteger');
                    const fraction = priceElement.querySelector('.vtex-product-price-1-x-currencyFraction');
                    let priceText = '$';
                    integers.forEach(int => priceText += int.textContent.trim());
                    if (fraction) {
                        priceText += ',' + fraction.textContent.trim();
                    }
                    return priceText;
                })() : "Precio no encontrado";

                productsData.push({
                    name: nameElement ? nameElement.innerText.trim() : "Nombre no encontrado",
                    price: price,
                    link: linkElement ? `https://diaonline.supermercadosdia.com.ar${linkElement.getAttribute("href")}` : "Link no encontrado",
                    image: imageElement ? imageElement.getAttribute("src") : "Imagen no encontrada"
                });
            }
            
            return productsData;
        });

        return products;
    } catch (error) {
        console.error("Error durante la búsqueda:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

export default searchDiaProduct;