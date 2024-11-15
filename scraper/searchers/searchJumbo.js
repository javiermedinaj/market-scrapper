import puppeteer from "puppeteer";

async function searchJumboProduct(productName) {
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

        const searchUrl = `https://www.jumbo.com.ar/${productName}?_q=${productName}&map=ft`;
        
        await page.goto(searchUrl, { 
            timeout: 120000,
            waitUntil: ['networkidle0', 'domcontentloaded']
        });

        await page.waitForSelector(".vtex-product-summary-2-x-container", {
            timeout: 120000,
            visible: true
        });

        const hasProducts = await page.evaluate(() => {
            return document.querySelectorAll(".vtex-product-summary-2-x-container").length > 0;
        });

        if (!hasProducts) {
            console.log("No se encontraron productos");
            return [];
        }
        
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll(".vtex-product-summary-2-x-container");
            const productsData = [];
            
            const limit = Math.min(productElements.length, 5);
            
            for(let i = 0; i < limit; i++) {
                const element = productElements[i];
                const nameElement = element.querySelector(".vtex-product-summary-2-x-nameContainer");
                const priceElement = element.querySelector(".jumboargentinaio-store-theme-1dCOMij_MzTzZOCohX1K7w");
                const linkElement = element.querySelector("a.vtex-product-summary-2-x-clearLink");
                const imageElement = element.querySelector(".vtex-product-summary-2-x-imageContainer img");
                
                productsData.push({
                    name: nameElement ? nameElement.innerText.trim() : "Nombre no encontrado",
                    price: priceElement ? priceElement.innerText.trim() : "Precio no encontrado",
                    link: linkElement ? `https://www.jumbo.com.ar${linkElement.getAttribute("href")}` : "Link no encontrado",
                    image: imageElement ? imageElement.getAttribute("src") : "Imagen no encontrada"
                });
            }
            
            return productsData;
        });
        console.log(`Búsqueda en Jumbo completada. Encontrados ${products.length} productos.`);
        return products;
    } catch (error) {
        console.error("Error durante la búsqueda:", error);
        return []; 
    } finally {
        await browser.close();
    }
}

export default searchJumboProduct;