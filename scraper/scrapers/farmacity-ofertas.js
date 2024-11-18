import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function extractProducts(page) {
    return await page.evaluate(() => {
        const productElements = document.querySelectorAll("section.vtex-product-summary-2-x-container");
        const productsData = [];

        productElements.forEach(element => {
            const nameElement = element.querySelector("h2.vtex-product-summary-2-x-productNameContainer span.vtex-product-summary-2-x-productBrand");
            const priceContainer = element.querySelector(".vtex-product-price-1-x-sellingPriceValue .vtex-product-price-1-x-currencyContainer");
            const linkElement = element.querySelector("a.vtex-product-summary-2-x-clearLink");
            const imageElement = element.querySelector("img.vtex-product-summary-2-x-imageNormal");

            if (nameElement && priceContainer && linkElement && imageElement) {
                let price = "Precio no encontrado";
                const currencyCode = priceContainer.querySelector(".vtex-product-price-1-x-currencyCode")?.innerText.trim() || "";
                const currencyIntegers = Array.from(priceContainer.querySelectorAll(".vtex-product-price-1-x-currencyInteger"))
                    .map(el => el.innerText.trim()).join("");
                const currencyGroup = priceContainer.querySelector(".vtex-product-price-1-x-currencyGroup")?.innerText.trim() || "";
                const currencyDecimal = priceContainer.querySelector(".vtex-product-price-1-x-currencyDecimal")?.innerText.trim() || "";
                const currencyFraction = priceContainer.querySelector(".vtex-product-price-1-x-currencyFraction")?.innerText.trim() || "";
                price = `${currencyCode} ${currencyIntegers}${currencyGroup}${currencyDecimal}${currencyFraction}`;

                const link = `https://www.farmacity.com${linkElement.getAttribute("href")}`;
                let imageSrc = imageElement.getAttribute("src");
                if (imageSrc && !imageSrc.startsWith('http')) {
                    imageSrc = `https://www.farmacity.com${imageSrc.startsWith('/') ? '' : '/'}${imageSrc}`;
                }

                productsData.push({
                    name: nameElement.innerText.trim(),
                    price: price,
                    link: link,
                    image: imageSrc
                });
            }
        });

        return productsData;
    });
}

async function farmacityScraper() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    try {
        const page = await browser.newPage();
        let allProducts = [];

        //esto se puede cambiar bajo preferencia yo solo queria traer pocos productos por el momento.
        const totalPages = 4;

        for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
            const url = `https://www.farmacity.com/2246?map=productClusterIds&order=OrderByTopSaleDESC&page=${currentPage}`;
            await page.goto(url, { timeout: 120000, waitUntil: 'networkidle2' });
            console.log(`Página ${currentPage} cargada.`);

            await page.waitForSelector("section.vtex-product-summary-2-x-container", { timeout: 60000 });
            console.log(`Contenedores de productos encontrados en la página ${currentPage}.`);

            const products = await extractProducts(page);
            console.log(`Encontrados ${products.length} productos en la página ${currentPage}.`);
            allProducts = allProducts.concat(products);

            await delay(2000);
        }

        const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.link, item])).values());

        const dataDir = path.join(__dirname, '..', 'data');
        await fs.mkdir(dataDir, { recursive: true });

        const filePath = path.join(dataDir, 'farmacity-ofertas.json');
        await fs.writeFile(filePath, JSON.stringify(uniqueProducts, null, 2));

        console.log(`Productos guardados correctamente en ${filePath}`);
    } catch (error) {
        console.error("Error ocurrido:", error);
    } finally {
        await browser.close();
    }
}

export default farmacityScraper;