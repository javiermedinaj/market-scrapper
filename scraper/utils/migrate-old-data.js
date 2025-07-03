import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

async function migrateOldData() {
  console.log('📦 Migrando datos antiguos al nuevo formato...\n');
  
  const stores = ['jumbo', 'carrefour', 'farmacity', 'dia', 'farma', 'coto'];
  const today = new Date().toISOString().split('T')[0];
  
  const dailyDir = path.join(dataDir, 'daily');
  await fs.mkdir(dailyDir, { recursive: true });
  
  const todayDir = path.join(dailyDir, today);
  await fs.mkdir(todayDir, { recursive: true });
  
  for (const store of stores) {
    const oldFile = path.join(dataDir, `${store}-ofertas.json`);
    const newFile = path.join(todayDir, `${store}-ofertas.json`);
    
    try {
      const oldContent = await fs.readFile(oldFile, 'utf-8');
      const oldData = JSON.parse(oldContent);
      
      const newData = {
        totalProducts: Array.isArray(oldData) ? oldData.length : 0,
        date: today,
        lastUpdate: new Date().toISOString(),
        data: Array.isArray(oldData) ? oldData : []
      };
      
      await fs.writeFile(newFile, JSON.stringify(newData, null, 2));
      
      console.log(`✅ ${store}: ${newData.totalProducts} productos migrados`);
      
    } catch (error) {
      console.log(`❌ ${store}: Error - ${error.message}`);
    }
  }
  
  console.log('\n📊 Migración completada!');
}

migrateOldData().catch(console.error);
