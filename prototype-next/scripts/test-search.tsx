import puppeteer from "puppeteer";

async function testSearch() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();

  page.on("console", (msg) => console.log("PAGE CONSOLE:", msg.text()));
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  await page.type('input[placeholder="Buscar..."]', "palta");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const resultsText = await page.evaluate(() => document.body.innerText);
  console.log("=== RESULTS TEXT ===");
  console.log(resultsText.slice(0, 2000));

  await browser.close();
}

testSearch().catch(console.error);
