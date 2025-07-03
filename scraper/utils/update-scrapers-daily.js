import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de scrapers a actualizar
const scrapers = [
    'jumbo-ofertas.js',
    'carrefour-ofertas.js',
    'coto-ofertas.js',
    'dia-ofertas.js',
    'farma-ofertas.js',
    'farmacity-ofertas.js'
];

async function updateScrapersForDailySystem() {
    console.log('🔄 Actualizando scrapers para usar el sistema de guardado por días...\n');
    
    for (const scraperFile of scrapers) {
        try {
            const scraperPath = path.join(__dirname, 'scrapers', scraperFile);
            console.log(`📝 Actualizando ${scraperFile}...`);
            
            let content = await fs.readFile(scraperPath, 'utf8');
            
            // Cambiar el import de dateStorage
            content = content.replace(
                "import { saveDataWithDate } from '../utils/dateStorage.js';",
                "import { saveDataByDay } from '../utils/dateStorage.js';"
            );
            
            // Cambiar la llamada a la función de guardado
            const storeName = scraperFile.replace('-ofertas.js', '');
            
            content = content.replace(
                `await saveDataWithDate(uniqueProducts, '${storeName}', dataDir);`,
                `await saveDataByDay(uniqueProducts, '${storeName}', dataDir);`
            );
            
            // Actualizar el mensaje de log
            content = content.replace(
                `console.log("✅ Productos de ${storeName.charAt(0).toUpperCase() + storeName.slice(1)} guardados correctamente con historial por fechas");`,
                `console.log("✅ Productos de ${storeName.charAt(0).toUpperCase() + storeName.slice(1)} guardados correctamente por día");`
            );
            
            await fs.writeFile(scraperPath, content);
            console.log(`✅ ${scraperFile} actualizado correctamente`);
            
        } catch (error) {
            console.error(`❌ Error al actualizar ${scraperFile}:`, error.message);
        }
    }
    
    console.log('\n🎉 Todos los scrapers actualizados para el sistema por días!');
}

updateScrapersForDailySystem().catch(console.error);
