import jumboScraper from './scrapers/jumbo-ofertas.js';
import carrefourScraper from './scrapers/carrefour-ofertas.js';
import diaScraper from './scrapers/dia-ofertas.js';

export async function runAllScrapers() {
  try {
    console.log('Iniciando todos los scrapers...');

    await jumboScraper();
    console.log('Jumbo scraper ejecutado exitosamente');

    await carrefourScraper();
    console.log('Carrefour scraper ejecutado exitosamente');

    await diaScraper();
    console.log('Dia scraper ejecutado exitosamente');

    console.log('Todos los scrapers se han ejecutado exitosamente');
  } catch (error) {
    console.error('Error al ejecutar los scrapers:', error);
  }
}

runAllScrapers().catch(console.error);