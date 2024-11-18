import jumboScraper from './scrapers/jumbo-ofertas.js';
import carrefourScraper from './scrapers/carrefour-ofertas.js';
import diaScraper from './scrapers/dia-ofertas.js';
import farmaScraper from './scrapers/farma-ofertas.js';
import farmacityScraper from './scrapers/farmacity-ofertas.js';
import cotoScraper from './scrapers/coto-ofertas.js';

export async function runAllScrapers() {
  try {
    console.log('Iniciando todos los scrapers...');

    await jumboScraper();
    console.log('Jumbo scraper ejecutado exitosamente');

    await carrefourScraper();
    console.log('Carrefour scraper ejecutado exitosamente');

    await diaScraper();
    console.log('Dia scraper ejecutado exitosamente');

    await farmaScraper();
    console.log('Farma scraper ejecutado exitosamente');

    await farmacityScraper();
    console.log('Farmacity scraper ejecutado exitosamente');

    await cotoScraper();
    console.log('Coto scraper ejecutado exitosamente');


    console.log('Todos los scrapers se han ejecutado exitosamente');
  } catch (error) {
    console.error('Error al ejecutar los scrapers:', error);
  }
}

runAllScrapers().catch(console.error);