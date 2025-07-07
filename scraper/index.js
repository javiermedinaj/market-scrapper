import jumboScraper from './scrapers/jumbo-ofertas.js';
import carrefourScraper from './scrapers/carrefour-ofertas.js';
import diaScraper from './scrapers/dia-ofertas.js';
import farmaScraper from './scrapers/farma-ofertas.js';
import farmacityScraper from './scrapers/farmacity-ofertas.js';
import cotoScraper from './scrapers/coto-ofertas.js';
// import { cleanOldFiles } from './utils/dateStorage.js'; // 🔒 DESACTIVADO PARA INVESTIGACIÓN
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runAllScrapers() {
  const startTime = new Date();
  const today = startTime.toISOString().split('T')[0];
  console.log(`🚀 Iniciando scrapers para ${today}... (${startTime.toISOString()})`);
  
  const results = [];
  
  try {
    const scrapers = [
      { name: 'Jumbo', fn: jumboScraper },
      { name: 'Carrefour', fn: carrefourScraper },
      { name: 'Día', fn: diaScraper },
      { name: 'Farma', fn: farmaScraper },
      { name: 'Farmacity', fn: farmacityScraper },
      { name: 'Coto', fn: cotoScraper }
    ];

    for (const scraper of scrapers) {
      try {
        console.log(`\n📊 Ejecutando ${scraper.name} scraper...`);
        const scraperStartTime = new Date();
        
        await scraper.fn();
        
        const scraperEndTime = new Date();
        const duration = Math.round((scraperEndTime - scraperStartTime) / 1000);
        
        console.log(`✅ ${scraper.name} scraper ejecutado exitosamente en ${duration}s`);
        results.push({ name: scraper.name, status: 'success', duration });
        
      } catch (error) {
        console.error(`❌ Error en ${scraper.name} scraper:`, error.message);
        results.push({ name: scraper.name, status: 'error', error: error.message });
      }
    }

    // 🔒 DESACTIVADO PARA INVESTIGACIÓN - No eliminar datos históricos
    // console.log('\n🧹 Limpiando archivos antiguos...');
    // const dataDir = path.join(__dirname, 'data');
    // await cleanOldFiles(dataDir, 30);

    const endTime = new Date();
    const totalDuration = Math.round((endTime - startTime) / 1000);
    
    console.log(`\n🎉 Proceso completado para ${today} en ${totalDuration}s`);
    console.log('\n📋 Resumen de ejecución:');
    
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : '❌';
      const info = result.status === 'success' 
        ? `${result.duration}s` 
        : result.error;
      console.log(`  ${status} ${result.name}: ${info}`);
    });

  } catch (error) {
    console.error('❌ Error general al ejecutar los scrapers:', error);
  }
}

export async function runSingleScraper(scraperName) {
  const startTime = new Date();
  console.log(`🚀 Ejecutando scraper específico: ${scraperName}...`);
  
  const scrapers = {
    jumbo: jumboScraper,
    carrefour: carrefourScraper,
    dia: diaScraper,
    farma: farmaScraper,
    farmacity: farmacityScraper,
    coto: cotoScraper
  };
  
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
    console.error('Stack trace completo:', error.stack);
  }
}

const singleScraperArg = process.argv[2];

if (singleScraperArg) {
  runSingleScraper(singleScraperArg);
} else {
  runAllScrapers().catch(console.error);
}