import searchProduct from './farma.js';

async function testSearch() {
    try {
        const searchTerm = 'ibuprofeno';
        console.log(`Buscando los 5 ${searchTerm} más baratos...`);
        
        const results = await searchProduct(searchTerm);
        console.log('\nResultados encontrados:');
        console.log(JSON.stringify(results, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testSearch();