import { saveDataWithDate } from '../utils/dateStorage.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Datos de prueba
const testData = [
    {
        name: "Producto de prueba 1",
        price: "$100",
        link: "https://ejemplo.com/producto1",
        image: "https://ejemplo.com/imagen1.jpg"
    },
    {
        name: "Producto de prueba 2", 
        price: "$200",
        link: "https://ejemplo.com/producto2",
        image: "https://ejemplo.com/imagen2.jpg"
    }
];

async function testSystem() {
    console.log('🧪 Iniciando prueba del sistema de guardado por fechas...\n');
    
    try {
        const dataDir = path.join(__dirname, 'data');
        
        // Probar guardado para diferentes stores
        const stores = ['test-jumbo', 'test-carrefour'];
        
        for (const store of stores) {
            console.log(`📊 Probando guardado para ${store}...`);
            
            const result = await saveDataWithDate(testData, store, dataDir);
            console.log(`✅ Guardado exitoso para ${store}`);
            console.log(`   📁 Historial: ${result.historyPath}`);
            console.log(`   📄 Último: ${result.latestPath}`);
            console.log(`   📊 Productos: ${result.totalProducts}\n`);
        }
        
        console.log('🎉 Prueba completada exitosamente!');
        console.log('\n📋 Para verificar los datos guardados, ejecuta:');
        console.log('   node data-manager.js stats');
        console.log('   node data-manager.js history test-jumbo');
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    }
}

testSystem().catch(console.error);
