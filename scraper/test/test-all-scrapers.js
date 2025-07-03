import { runSingleScraper } from '../utils/run-single-scraper.js';

async function testAllScrapers() {
    const scrapers = ['jumbo', 'carrefour', 'farmacity', 'dia', 'farma', 'coto'];
    const results = [];
    
    console.log('🔍 Probando todos los scrapers...\n');
    
    for (const scraper of scrapers) {
        console.log(`\n🧪 Probando ${scraper}...`);
        const startTime = new Date();
        
        try {
            await runSingleScraper(scraper);
            const duration = Math.round((new Date() - startTime) / 1000);
            results.push({ scraper, status: 'SUCCESS', duration: `${duration}s` });
        } catch (error) {
            const duration = Math.round((new Date() - startTime) / 1000);
            results.push({ 
                scraper, 
                status: 'ERROR', 
                duration: `${duration}s`,
                error: error.message 
            });
        }
    }
    
    console.log('\n\n📊 RESUMEN DE PRUEBAS:');
    console.log('========================');
    
    results.forEach(result => {
        const status = result.status === 'SUCCESS' ? '✅' : '❌';
        console.log(`${status} ${result.scraper.padEnd(10)} - ${result.duration.padEnd(5)} - ${result.status}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    const successCount = results.filter(r => r.status === 'SUCCESS').length;
    console.log(`\n🎯 ${successCount}/${results.length} scrapers funcionando correctamente`);
}

testAllScrapers().catch(console.error);
