

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DAILY_DIR = path.join(DATA_DIR, 'daily');

const STORES = [
  'carrefour',
  'coto', 
  'dia',
  'farma',
  'farmacity',
  'jumbo'
];

function getLatestDate() {
  if (!fs.existsSync(DAILY_DIR)) {
    console.log('⚠️ No existe la carpeta daily');
    return null;
  }
  
  const dates = fs.readdirSync(DAILY_DIR)
    .filter(dir => /^\d{4}-\d{2}-\d{2}$/.test(dir))
    .sort()
    .reverse();
  
  return dates.length > 0 ? dates[0] : null;
}

function updateStaticData() {
  console.log('🔄 Actualizando datos estáticos...');
  
  const latestDate = getLatestDate();
  if (!latestDate) {
    console.log('❌ No se encontraron datos diarios');
    return;
  }
  
  console.log(`📅 Usando datos del: ${latestDate}`);
  
  const sourcePath = path.join(DAILY_DIR, latestDate);
  let updatedCount = 0;
  
  STORES.forEach(store => {
    const sourceFile = path.join(sourcePath, `${store}-ofertas.json`);
    const targetFile = path.join(DATA_DIR, `${store}-ofertas.json`);
    
    try {
      if (fs.existsSync(sourceFile)) {
        const fileData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
        
        let data;
        if (fileData.data && Array.isArray(fileData.data)) {
          data = fileData.data;
        } else if (Array.isArray(fileData)) {
          data = fileData;
        } else {
          console.log(`⚠️ ${store}: formato de datos no reconocido`);
          return;
        }

        if (Array.isArray(data) && data.length > 0) {
          fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));
          console.log(`✅ ${store}: ${data.length} ofertas actualizadas`);
          updatedCount++;
        } else {
          console.log(`⚠️ ${store}: datos vacíos o inválidos`);
        }
      } else {
        console.log(`⚠️ ${store}: archivo no encontrado en ${latestDate}`);
      }
    } catch (error) {
      console.error(`❌ Error procesando ${store}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Proceso completado: ${updatedCount}/${STORES.length} tiendas actualizadas`);

  const metadata = {
    lastUpdate: new Date().toISOString(),
    sourceDate: latestDate,
    updatedStores: updatedCount,
    totalStores: STORES.length
  };
  
  fs.writeFileSync(
    path.join(DATA_DIR, 'static-data-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('📋 Metadata guardada en static-data-metadata.json');
}

function checkStaticData() {
  console.log('\n📊 Estado de los datos estáticos:');
  console.log('=====================================');
  
  STORES.forEach(store => {
    const file = path.join(DATA_DIR, `${store}-ofertas.json`);
    
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const stats = fs.statSync(file);
        console.log(`${store.padEnd(12)}: ${data.length} ofertas | Modificado: ${stats.mtime.toLocaleString()}`);
      } catch (error) {
        console.log(`${store.padEnd(12)}: ❌ Error leyendo archivo`);
      }
    } else {
      console.log(`${store.padEnd(12)}: ❌ Archivo no existe`);
    }
  });
}

function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'update':
      updateStaticData();
      break;
    case 'check':
      checkStaticData();
      break;
    default:
      console.log('🛠️ Actualizador de datos estáticos');
      console.log('=====================================');
      console.log('Comandos disponibles:');
      console.log('  update - Actualiza los archivos JSON con los datos más recientes');
      console.log('  check  - Verifica el estado de los datos estáticos');
      console.log('');
      console.log('Ejemplos:');
      console.log('  node update-static-data.js update');
      console.log('  node update-static-data.js check');
      break;
  }
}

main();

export { updateStaticData, checkStaticData };
