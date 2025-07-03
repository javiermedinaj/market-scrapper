
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getStoreHistory, cleanOldFiles, getAllTodayOrLatestData, getAvailableDates } from './utils/dateStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, 'data');

function showHelp() {
    console.log(`
📊 Gestor de Datos del Market Scraper (Sistema por Días)
========================================================

Uso: node data-manager.js [comando] [opciones]

Comandos disponibles:
  today              - Mostrar datos del día actual
  history <store>    - Mostrar historial de un store específico
  dates              - Mostrar fechas disponibles
  date <YYYY-MM-DD>  - Mostrar datos de una fecha específica
  stats              - Mostrar estadísticas generales
  clean [días]       - Limpiar archivos antiguos (default: 30 días)
  help               - Mostrar esta ayuda

Ejemplos:
  node data-manager.js today
  node data-manager.js history jumbo
  node data-manager.js dates
  node data-manager.js date 2025-07-03
  node data-manager.js stats
  node data-manager.js clean 7
  node data-manager.js help

Stores disponibles: jumbo, carrefour, dia, farma, farmacity, coto
`);
}

//historiall
async function showHistory(store, limit = 10) {
    try {
        console.log(`\n📋 Historial de ${store.toUpperCase()}:`);
        console.log('='.repeat(50));
        
        const history = await getStoreHistory(store, dataDir, limit);
        
        if (history.length === 0) {
            console.log(`❌ No se encontraron datos para ${store}`);
            return;
        }

        history.forEach((entry, index) => {
            const date = new Date(entry.lastUpdate || entry.timestamp).toLocaleString('es-ES');
            const isToday = entry.date === new Date().toISOString().split('T')[0];
            const icon = isToday ? '🆕' : '📅';
            
            console.log(`${icon} ${index + 1}. ${entry.date}${isToday ? ' (HOY)' : ''}`);
            console.log(`   📦 Productos: ${entry.totalProducts}`);
            console.log(`   ⏰ Actualizado: ${date}`);
            console.log();
        });

        console.log(`✅ Total de registros encontrados: ${history.length}`);
        
    } catch (error) {
        console.error(`❌ Error al obtener historial para ${store}:`, error.message);
    }
}

async function showStats() {
    try {
        console.log('\n📊 Estadísticas Generales:');
        console.log('='.repeat(50));
        
        const today = new Date().toISOString().split('T')[0];
        const allData = await getAllTodayOrLatestData(dataDir);
        const dates = await getAvailableDates(dataDir);
        
        console.log(`📅 Fecha actual: ${today}`);
        console.log(`📅 Total de fechas con datos: ${dates.length}`);
        console.log();
        
        for (const [store, info] of Object.entries(allData)) {
            if (info.data && !info.error) {
                const isToday = info.date === today;
                const statusIcon = isToday ? '🆕' : '📋';
                const statusText = isToday ? 'HOY' : `${info.date} (más reciente)`;
                
                console.log(`${statusIcon} ${store.toUpperCase()}`);
                console.log(`   📅 Fecha: ${statusText}`);
                console.log(`   📦 Productos: ${info.data.totalProducts}`);
                console.log(`   ⏰ Actualizado: ${new Date(info.data.lastUpdate || info.data.timestamp).toLocaleString('es-ES')}`);
                console.log();
            } else {
                console.log(`❌ ${store.toUpperCase()}`);
                console.log(`   Sin datos disponibles`);
                console.log();
            }
        }
        
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error.message);
    }
}

async function cleanData(days = 30) {
    try {
        console.log(`\n🧹 Limpiando archivos anteriores a ${days} días...`);
        console.log('='.repeat(50));
        
        await cleanOldFiles(dataDir, days);
        
        console.log('✅ Limpieza completada');
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error.message);
    }
}

async function showToday() {
    try {
        console.log('\n📅 Datos del Día Actual:');
        console.log('='.repeat(50));
        
        const today = new Date().toISOString().split('T')[0];
        const allData = await getAllTodayOrLatestData(dataDir);
        
        console.log(`📅 Fecha objetivo: ${today}`);
        console.log();
        
        for (const [store, info] of Object.entries(allData)) {
            if (info.data && !info.error) {
                const isToday = info.date === today;
                const statusIcon = isToday ? '🆕' : '📋';
                const statusText = isToday ? 'HOY' : `${info.date} (más reciente)`;
                
                console.log(`${statusIcon} ${store.toUpperCase()}`);
                console.log(`   📅 Fecha: ${statusText}`);
                console.log(`   📦 Productos: ${info.data.totalProducts}`);
                console.log(`   ⏰ Actualizado: ${new Date(info.data.lastUpdate || info.data.timestamp).toLocaleString('es-ES')}`);
                console.log();
            } else {
                console.log(`❌ ${store.toUpperCase()}`);
                console.log(`   Sin datos disponibles`);
                console.log();
            }
        }
        
    } catch (error) {
        console.error('❌ Error al obtener datos del día:', error.message);
    }
}

async function showDates() {
    try {
        console.log('\n📅 Fechas Disponibles:');
        console.log('='.repeat(50));
        
        const dates = await getAvailableDates(dataDir);
        const today = new Date().toISOString().split('T')[0];
        
        if (dates.length === 0) {
            console.log('❌ No hay fechas disponibles');
            return;
        }
        
        console.log(`📊 Total de fechas: ${dates.length}`);
        console.log();
        
        dates.forEach((date, index) => {
            const isToday = date === today;
            const icon = isToday ? '🆕' : '📅';
            const label = isToday ? ' (HOY)' : '';
            console.log(`${icon} ${date}${label}`);
        });
        
    } catch (error) {
        console.error('❌ Error al obtener fechas:', error.message);
    }
}

async function showDateData(targetDate) {
    try {
        console.log(`\n📅 Datos para ${targetDate}:`);
        console.log('='.repeat(50));
        
        const allData = await getAllTodayOrLatestData(dataDir, targetDate);
        
        for (const [store, info] of Object.entries(allData)) {
            if (info.data && !info.error) {
                const isExactDate = info.date === targetDate;
                const statusIcon = isExactDate ? '✅' : '📋';
                const statusText = isExactDate ? 'FECHA EXACTA' : `${info.date} (más reciente disponible)`;
                
                console.log(`${statusIcon} ${store.toUpperCase()}`);
                console.log(`   📅 Fecha: ${statusText}`);
                console.log(`   📦 Productos: ${info.data.totalProducts}`);
                console.log(`   ⏰ Actualizado: ${new Date(info.data.lastUpdate || info.data.timestamp).toLocaleString('es-ES')}`);
                console.log();
            } else {
                console.log(`❌ ${store.toUpperCase()}`);
                console.log(`   Sin datos disponibles para ${targetDate}`);
                console.log();
            }
        }
        
    } catch (error) {
        console.error(`❌ Error al obtener datos para ${targetDate}:`, error.message);
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'help') {
        showHelp();
        return;
    }
    
    const command = args[0];
    
    switch (command) {
        case 'today':
            await showToday();
            break;
            
        case 'history':
            if (args.length < 2) {
                console.error('❌ Error: Debes especificar un store');
                console.log('Uso: node data-manager.js history <store>');
                return;
            }
            await showHistory(args[1], args[2] ? parseInt(args[2]) : 10);
            break;
            
        case 'dates':
            await showDates();
            break;
            
        case 'date':
            if (args.length < 2) {
                console.error('❌ Error: Debes especificar una fecha en formato YYYY-MM-DD');
                console.log('Uso: node data-manager.js date <YYYY-MM-DD>');
                return;
            }
            await showDateData(args[1]);
            break;
            
        case 'stats':
            await showStats();
            break;
            
        case 'clean':
            const days = args[1] ? parseInt(args[1]) : 30;
            if (isNaN(days) || days < 1) {
                console.error('❌ Error: El número de días debe ser un entero positivo');
                return;
            }
            await cleanData(days);
            break;
            
        default:
            console.error(`❌ Comando desconocido: ${command}`);
            showHelp();
    }
}

main().catch(console.error);
