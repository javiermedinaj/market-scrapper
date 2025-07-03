import jumboScraper from '../scrapers/jumbo-ofertas.js';
import carrefourScraper from '../scrapers/carrefour-ofertas.js';
import diaScraper from '../scrapers/dia-ofertas.js';
import farmaScraper from '../scrapers/farma-ofertas.js';
import farmacityScraper from '../scrapers/farmacity-ofertas.js';
import cotoScraper from '../scrapers/coto-ofertas.js';

const scrapers = {
  jumbo: jumboScraper,
  carrefour: carrefourScraper,
  dia: diaScraper,
  farma: farmaScraper,
  farmacity: farmacityScraper,
  coto: cotoScraper
};

async function runSingleScraper(scraperName) {
  const startTime = new Date();
  console.log(`🚀 Ejecutando scraper: ${scraperName}...`);
  
  const scraper = scrapers[scraperName.toLowerCase()];
  
  if (!scraper) {
    console.error(`❌ Scraper "${scraperName}" no encontrado.`);
    console.log('📋 Scrapers disponibles:', Object.keys(scrapers).join(', '));
    return;
  }
  
  try {
    await scraper();
    
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    console.log(`✅ ${scraperName} completado exitosamente en ${duration}s`);
    
  } catch (error) {
    console.error(`❌ Error en ${scraperName}:`, error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Obtener el nombre del scraper desde argumentos de línea de comandos
const scraperName = process.argv[2];

if (!scraperName) {
  console.log('❓ Uso: node run-single-scraper.js <nombre_scraper>');
  console.log('📋 Scrapers disponibles:', Object.keys(scrapers).join(', '));
  console.log('💡 Ejemplo: node run-single-scraper.js jumbo');
} else {
  runSingleScraper(scraperName);
}
