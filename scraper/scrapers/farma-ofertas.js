import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function farmaScraper() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        await page.goto("https://www.farmaonline.com/ofertas-home", { timeout: 120000 });
        let allProducts = [];

        const extractProducts = async () => {
            return page.evaluate(() => {
                const productElements = document.querySelectorAll(".vtex-product-summary-2-x-container");
                const products = [];

                productElements.forEach((element) => {
                    const nameElement = element.querySelector(".vtex-product-summary-2-x-productBrand");
                    const priceContainer = element.querySelector(".vtex-product-price-1-x-sellingPriceValue");
                    const linkElement = element.querySelector("a.vtex-product-summary-2-x-clearLink");
                    const imageElement = element.querySelector(".vtex-product-summary-2-x-imageNormal");
                    const promoElement = element.querySelector(".farmaonline-administrable-highlights-0-x-MasXmenosText");

            
                    if (nameElement && priceContainer) {
                        let price = "Precio no encontrado";
                        if (priceContainer) {
                            const currencyCode = priceContainer.querySelector(".vtex-product-price-1-x-currencyCode")?.innerText.trim() || "";
                            const currencyIntegers = Array.from(priceContainer.querySelectorAll(".vtex-product-price-1-x-currencyInteger"))
                                .map(el => el.innerText.trim())
                                .join("");
                            const currencyDecimal = priceContainer.querySelector(".vtex-product-price-1-x-currencyDecimal")?.innerText.trim() || "";
                            const currencyFraction = priceContainer.querySelector(".vtex-product-price-1-x-currencyFraction")?.innerText.trim() || "";
                            
                            price = `${currencyCode} ${currencyIntegers}${currencyDecimal}${currencyFraction}`;
                        }

                        products.push({
                            name: nameElement.innerText.trim(),
                            price: price,
                            link: linkElement ? `https://www.farmaonline.com${linkElement.getAttribute("href")}` : null,
                            image: imageElement ? imageElement.getAttribute("src") : null,
                            promo: promoElement ? promoElement.innerText.trim() : null,
                            category: null 
                        });
                    }
                });
                return products;
            });
        };

        const categoryButtons = await page.$$('.vtex-tab-layout-0-x-listItem button');
        
        for (const button of categoryButtons) {
            const categoryName = await page.evaluate(el => el.innerText.trim(), button);
            console.log(`Extrayendo productos de categoría: ${categoryName}`);
            
            await button.click();
            await delay(2000);
            
            const categoryProducts = await extractProducts();
            console.log(`Encontrados ${categoryProducts.length} productos en ${categoryName}`);
            
            categoryProducts.forEach(product => {
                if (product) {
                    product.category = categoryName;
                }
            });

            allProducts = [...allProducts, ...categoryProducts];
        }

        const dataDir = path.join(__dirname, '..', 'data');
        await fs.mkdir(dataDir, { recursive: true });

        const filePath = path.join(dataDir, 'farma-ofertas.json');
        await fs.writeFile(filePath, JSON.stringify(allProducts, null, 2));
        console.log(`Guardados ${allProducts.length} productos en farma-ofertas.json`);

    } catch (error) {
        console.error("Error occurred:", error);
        throw error;
    } finally {
        await browser.close();
    }
}


export default farmaScraper;