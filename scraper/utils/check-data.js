import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

async function checkData() {
  console.log('📊 Verificando estructura de datos...\n');
  
  try {
    const todayDir = path.join(dataDir, 'today');
    console.log('📁 Carpeta today:');
    try {
      const todayFiles = await fs.readdir(todayDir);
      for (const file of todayFiles) {
        const filePath = path.join(todayDir, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        console.log(`  ${file}: ${data.totalProducts || 0} productos (${stats.size} bytes)`);
      }
    } catch (error) {
      console.log('  No existe o está vacía');
    }

    const dailyDir = path.join(dataDir, 'daily');
    console.log('\n📁 Carpeta daily:');
    try {
      const dailyDates = await fs.readdir(dailyDir);
      for (const date of dailyDates) {
        console.log(`  📅 ${date}:`);
        const dateDir = path.join(dailyDir, date);
        const dateFiles = await fs.readdir(dateDir);
        for (const file of dateFiles) {
          const filePath = path.join(dateDir, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          console.log(`    ${file}: ${data.totalProducts || data.data?.length || 0} productos (${stats.size} bytes)`);
        }
      }
    } catch (error) {
      console.log('  No existe o está vacía');
    }

    console.log('\n📁 Archivos antiguos en data:');
    try {
      const dataFiles = await fs.readdir(dataDir);
      for (const file of dataFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(dataDir, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          console.log(`  ${file}: ${Array.isArray(data) ? data.length : 'objeto'} (${stats.size} bytes)`);
        }
      }
    } catch (error) {
      console.log('  Error al leer archivos antiguos');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();