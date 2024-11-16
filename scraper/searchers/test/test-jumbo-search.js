import searchJumboProduct from '../searchJumbo.js';

async function testJumboSearch() {
    try {
        const searchTerm = 'papas fritas';
        console.log(`Buscando los 5 productos de ${searchTerm} en Jumbo...`);
        
        const results = await searchJumboProduct(searchTerm);
        console.log('\nResultados encontrados:');
        console.log(JSON.stringify(results, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testJumboSearch();
