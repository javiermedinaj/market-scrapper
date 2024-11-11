import searchDiaProduct from '../searchDia.js';

async function testDiaSearch() {
    try {
        const searchTerm = 'papas fritas';
        console.log(`Buscando los 5 productos de ${searchTerm} en Dia...`);
        
        const results = await searchDiaProduct(searchTerm);
        console.log('\nResultados encontrados:');
        console.log(JSON.stringify(results, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testDiaSearch();