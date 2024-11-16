// test-carrefour-search.js
import searchCarrefourProduct from '../searchCarrefour.js';

async function testCarrefourSearch() {
    try {
        console.log('Iniciando test de búsqueda en Carrefour...');
        
        // Definir solo un término de búsqueda
        const searchTerm = 'polenta';
        
        console.log(`\nBuscando: ${searchTerm}`);
        const results = await searchCarrefourProduct(searchTerm);
        
        console.log(`Resultados encontrados: ${results.length}`);
        if (results.length > 0) {
            console.log('\nPrimeros 5 productos:');
            results.forEach((product, index) => {
                console.log(`\n${index + 1}. ${product.name}`);
                console.log(`   Precio: ${product.price}`);
                console.log(`   Link: ${product.link}`);
            });
        } else {
            console.log('No se encontraron productos para la búsqueda.');
        }
        
    } catch (error) {
        console.error('Error en test:', error);
    }
}

testCarrefourSearch();