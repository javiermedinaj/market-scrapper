import searchCarrefourProduct from '../searchCarrefour.js';

async function testCarrefourSearch() {
    try {
        const searchTerm = 'yerba';
        console.log(`Buscando los 5 productos de ${searchTerm} en Carrefour...`);
        
        const results = await searchCarrefourProduct(searchTerm);
        console.log('\nResultados encontrados:');
        console.log(JSON.stringify(results, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testCarrefourSearch();