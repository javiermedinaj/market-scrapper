import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scrapers = [
    'carrefour-ofertas.js',
    'coto-ofertas.js',
    'dia-ofertas.js',
    'farma-ofertas.js',
    'farmacity-ofertas.js'
];

async function fixScrapers() {
    console.log('🔧 Corrigiendo nombres de funciones en scrapers...\n');
    
    for (const scraperFile of scrapers) {
        try {
            const scraperPath = path.join(__dirname, 'scrapers', scraperFile);
            console.log(`🔧 Corrigiendo ${scraperFile}...`);
            
            let content = await fs.readFile(scraperPath, 'utf8');
            
            content = content.replace(
                "import { saveDataByDay } from '../utils/dateStorage.js';",
                "import { saveDataWithDate } from '../utils/dateStorage.js';"
            );

            content = content.replace(
                /await saveDataByDay\(/g,
                "await saveDataWithDate("
            );
            
            await fs.writeFile(scraperPath, content);
            console.log(`✅ ${scraperFile} corregido`);
            
        } catch (error) {
            console.error(`❌ Error al corregir ${scraperFile}:`, error.message);
        }
    }
    
    console.log('\n🎉 Todos los scrapers corregidos!');
}

fixScrapers().catch(console.error);
