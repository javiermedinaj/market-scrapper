import puppeteer from "puppeteer";

async function searchCarrefourProduct(productName) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-extensions'
        ],
        executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome'
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });

        const searchUrl = `https://www.carrefour.com.ar/${productName}?_q=${productName}&map=ft&order=OrderByPriceASC`;
        await page.goto(searchUrl, { timeout: 50000 });
    
        await page.waitForSelector(".valtech-carrefourar-product-summary-status-0-x-container");
        
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll(".valtech-carrefourar-product-summary-status-0-x-container");
            const productsData = [];
            
            const limit = Math.min(productElements.length, 5);
            
            for(let i = 0; i < limit; i++) {
                const element = productElements[i];
                const nameElement = element.querySelector(".vtex-product-summary-2-x-productBrand");
                const priceElement = element.querySelector(".valtech-carrefourar-product-price-0-x-sellingPriceValue");
                // Buscar el link en el elemento padre más cercano
                const linkElement = element.closest('a') || element.querySelector('a');
                const imageElement = element.querySelector(".vtex-product-summary-2-x-imageContainer img");
                
                productsData.push({
                    name: nameElement ? nameElement.innerText.trim() : "Nombre no encontrado",
                    price: priceElement ? priceElement.innerText.trim() : "Precio no encontrado",
                    link: linkElement ? `https://www.carrefour.com.ar${linkElement.getAttribute("href")}` : "Link no encontrado",
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

export default searchCarrefourProduct;