import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from 'url';
import { saveDataWithDate } from '../utils/dateStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function diaScraper() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        console.log('🔍 Navegando a la página de Día...');
        await page.goto("https://diaonline.supermercadosdia.com.ar/especial-ofertas", { timeout: 20000 });
        
        console.log('⏳ Esperando a que carguen los productos...');
        await page.waitForSelector('.vtex-product-summary-2-x-element', { timeout: 10000 });
        
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('.vtex-product-summary-2-x-element');
            const productsData = [];
            
            productElements.forEach((element, index) => {
                try {
                    const nameElement = element.querySelector('.vtex-product-summary-2-x-productBrand');
                    const name = nameElement ? nameElement.innerText.trim() : `Producto Día ${index + 1}`;
                    
                    const priceElement = element.querySelector('.diaio-store-5-x-sellingPriceValue');
                    const price = priceElement ? priceElement.innerText.trim() : "Precio no disponible";
                    
                    const oldPriceElement = element.querySelector('.diaio-store-5-x-listPriceValue');
                    const oldPrice = oldPriceElement ? oldPriceElement.innerText.trim() : null;
                    
                    const discountElement = element.querySelector('.vtex-product-price-1-x-savingsPercentage');
                    const discount = discountElement ? discountElement.innerText.trim() : null;
                    
                    const imageElement = element.querySelector('.vtex-product-summary-2-x-imageNormal');
                    let image = imageElement ? imageElement.src : null;
                    
                    const linkElement = element.querySelector('a');
                    let link = linkElement ? linkElement.href : "https://diaonline.supermercadosdia.com.ar/especial-ofertas";
                    
                    if (image && !image.startsWith('http')) {
                        image = `https://diaonline.supermercadosdia.com.ar${image}`;
                    }
                    if (link && !link.startsWith('http')) {
                        link = `https://diaonline.supermercadosdia.com.ar${link}`;
                    }
                    
                    if (name && price) {
                        productsData.push({
                            name: name,
                            price: price,
                            oldPrice: oldPrice,
                            discount: discount,
                            image: image,
                            link: link
                        });
                    }
                } catch (error) {
                    console.error(`Error procesando producto ${index}:`, error);
                }
            });
            
            return productsData;
        });
        
        console.log(`✅ Obtenidos ${products.length} productos de Día`);
        const uniqueProducts = products.filter((product, index, self) =>
            index === self.findIndex(p => p.name === product.name)
        );
        
        console.log(`🔄 Productos únicos después de filtrar: ${uniqueProducts.length}`);
        
        const dataDir = path.join(__dirname, '..', 'data');
        await saveDataWithDate(uniqueProducts, 'dia', dataDir);
        
        console.log("✅ Productos de Día guardados correctamente por día");
        
    } catch (error) {
        console.error("Error occurred:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

export default diaScraper;