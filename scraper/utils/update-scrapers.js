import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de scrapers a actualizar
const scrapers = [
    'carrefour-ofertas.js',
    'coto-ofertas.js',
    'dia-ofertas.js',
    'farma-ofertas.js',
    'farmacity-ofertas.js'
];

async function updateScrapers() {
    console.log('🔄 Actualizando scrapers para usar el sistema de guardado por fechas...\n');
    
    for (const scraperFile of scrapers) {
        try {
            const scraperPath = path.join(__dirname, 'scrapers', scraperFile);
            console.log(`📝 Actualizando ${scraperFile}...`);
            
            let content = await fs.readFile(scraperPath, 'utf8');
            
            // Agregar import de dateStorage si no existe
            if (!content.includes('saveDataWithDate')) {
                content = content.replace(
                    "import { dirname } from 'path';",
                    "import { dirname } from 'path';\nimport { saveDataWithDate } from '../utils/dateStorage.js';"
                );
            }
            
            // Reemplazar el código de guardado tradicional
            const storeName = scraperFile.replace('-ofertas.js', '');
            
            // Buscar el patrón de guardado actual y reemplazarlo
            const oldSavePattern = new RegExp(
                `(const dataDir = path\\.join\\(__dirname, '\\.\\.', 'data'\\);[\\s\\S]*?)(await fs\\.mkdir\\(dataDir, \\{ recursive: true \\}\\);[\\s\\S]*?const filePath = path\\.join\\(dataDir, '${storeName}-ofertas\\.json'\\);[\\s\\S]*?await fs\\.writeFile\\(filePath, JSON\\.stringify\\([^,]+, null, 2\\)\\);[\\s\\S]*?console\\.log\\([^)]+\\);)`,
                'g'
            );
            
            const newSaveCode = `$1// Usar el nuevo sistema de guardado con fechas
        await saveDataWithDate(uniqueProducts, '${storeName}', dataDir);

        console.log("✅ Productos de ${storeName.charAt(0).toUpperCase() + storeName.slice(1)} guardados correctamente con historial por fechas");`;
            
            content = content.replace(oldSavePattern, newSaveCode);
            
            // Si no se pudo hacer el reemplazo automático, mostrar advertencia
            if (content.includes(`${storeName}-ofertas.json`)) {
                console.log(`⚠️  No se pudo actualizar automáticamente ${scraperFile}. Requiere actualización manual.`);
            } else {
                await fs.writeFile(scraperPath, content);
                console.log(`✅ ${scraperFile} actualizado correctamente`);
            }
            
        } catch (error) {
            console.error(`❌ Error al actualizar ${scraperFile}:`, error.message);
        }
    }
    
    console.log('\n🎉 Proceso de actualización completado!');
}

updateScrapers().catch(console.error);
