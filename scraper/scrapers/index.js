import  jumboScraper from './jumbo-ofertas.js';
import  carrefourScraper from './carrefour-ofertas.js';
import  diaScraper from './dia-ofertas.js';

export async function runAllScrapers() {
  try {
    console.log('Iniciando todos los scrapers...');
    await Promise.all([
      jumboScraper(),
      carrefourScraper(),
      diaScraper()
    ]);
    console.log('Todos los scrapers se han ejecutado exitosamente');
  } catch (error) {
    console.error('Error al ejecutar los scrapers:', error);
  }
}
