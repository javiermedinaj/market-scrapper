import puppeteer from "puppeteer";

async function searchProduct(productName) {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });

        const searchUrl = `https://www.farmaonline.com/${productName}?_q=${productName}&map=ft&order=OrderByPriceASC`;
        await page.goto(searchUrl);
    
        await page.waitForSelector("article.vtex-product-summary-2-x-element");
        
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll("article.vtex-product-summary-2-x-element");
            const productsData = [];
            
            const limit = Math.min(productElements.length, 5);
            
            for(let i = 0; i < limit; i++) {
                const element = productElements[i];
                const nameElement = element.querySelector(".vtex-product-summary-2-x-productBrand");
                const priceElement = element.querySelector(".vtex-product-price-1-x-sellingPriceValue");
                const linkElement = element.closest('a');
                
                productsData.push({
                    name: nameElement ? nameElement.innerText.trim() : "Nombre no encontrado",
                    price: priceElement ? priceElement.innerText.trim() : "Precio no encontrado",
                    link: linkElement ? `https://www.farmaonline.com${linkElement.getAttribute("href")}` : "Link no encontrado"
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

export default searchProduct;