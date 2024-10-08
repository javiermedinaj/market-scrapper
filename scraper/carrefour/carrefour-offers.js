import puppeteer from "puppeteer";
import fs from "fs/promises";

async function navigateWebPage() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
    });

    try {
        const page = await browser.newPage();
        await page.goto("https://www.carrefour.com.ar/promociones");

        // Función de retraso
        const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

        // Espera 10 segundos para que la página cargue completamente
        await delay(10000);

        const images = await page.evaluate(() => {
            const imageElements = document.querySelectorAll(".valtech-carrefourar-offline-promotions-0-x-T4Col2Image img");
            const imageUrls = [];

            imageElements.forEach((element) => {
                const src = element.getAttribute("src");
                if (src) {
                    imageUrls.push(`https://www.carrefour.com.ar${src}`);
                }
            });

            return imageUrls;
        });

        console.log(images);

        await fs.writeFile("carrefour-images.json", JSON.stringify(images, null, 2));

        console.log("Imágenes guardadas correctamente en carrefour-images.json");

        await browser.close();
    } catch (error) {
        console.error("Error occurred:", error);
        await browser.close();
    }
}

navigateWebPage();