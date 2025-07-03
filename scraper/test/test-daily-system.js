import { saveDataWithDate, getTodayOrLatestData, getAllTodayOrLatestData, getAvailableDates } from '../utils/dateStorage.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDailySystem() {
    console.log('🧪 Iniciando prueba del sistema por días...\n');
    
    const dataDir = path.join(__dirname, 'data');
    
    // Datos de prueba
    const testData = {
        jumbo: [
            { name: 'Producto Jumbo 1', price: '$100', link: 'https://jumbo.com/1', image: 'img1.jpg' },
            { name: 'Producto Jumbo 2', price: '$200', link: 'https://jumbo.com/2', image: 'img2.jpg' }
        ],
        carrefour: [
            { name: 'Producto Carrefour 1', price: '$150', link: 'https://carrefour.com/1', image: 'img3.jpg' },
            { name: 'Producto Carrefour 2', price: '$250', link: 'https://carrefour.com/2', image: 'img4.jpg' }
        ]
    };
    
    try {
        // 1. Guardar datos de prueba
        console.log('📊 Guardando datos de prueba...');
        for (const [store, products] of Object.entries(testData)) {
            const result = await saveDataWithDate(products, store, dataDir);
            console.log(`✅ ${store}: ${result.totalProducts} productos guardados`);
        }
        
        console.log('\n📅 Probando obtención de datos...');
        
        // 2. Obtener datos de hoy
        console.log('\n🔍 Obteniendo datos de hoy:');
        const todayData = await getAllTodayOrLatestData(dataDir);
        for (const [store, info] of Object.entries(todayData)) {
            if (info.data && !info.error) {
                console.log(`✅ ${store}: ${info.data.totalProducts} productos (${info.source}, ${info.date})`);
            } else {
                console.log(`❌ ${store}: ${info.error}`);
            }
        }
        
        // 3. Obtener datos de un store específico
        console.log('\n🔍 Obteniendo datos específicos de Jumbo:');
        const jumboData = await getTodayOrLatestData('jumbo', dataDir);
        console.log(`✅ Jumbo: ${jumboData.data.totalProducts} productos (${jumboData.source}, ${jumboData.date})`);
        
        // 4. Listar fechas disponibles
        console.log('\n📅 Fechas disponibles:');
        const dates = await getAvailableDates(dataDir);
        dates.forEach(date => console.log(`  📅 ${date}`));
        
        // 5. Simular obtención de fecha específica
        if (dates.length > 0) {
            const specificDate = dates[0];
            console.log(`\n🔍 Obteniendo datos para fecha específica: ${specificDate}`);
            const dateData = await getAllTodayOrLatestData(dataDir, specificDate);
            for (const [store, info] of Object.entries(dateData)) {
                if (info.data && !info.error) {
                    console.log(`✅ ${store}: ${info.data.totalProducts} productos`);
                }
            }
        }
        
        console.log('\n🎉 Prueba del sistema por días completada exitosamente!');
        console.log('\n📋 Estructura creada:');
        console.log(`   📁 data/daily/${new Date().toISOString().split('T')[0]}/`);
        console.log(`   📁 data/today/`);
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    }
}

testDailySystem().catch(console.error);
