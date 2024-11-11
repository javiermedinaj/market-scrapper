import searchAllMarkets from '../searchAllMarkets.js';

async function testSearch() {
    try {
        const searchTerm = 'papas fritas';
        console.log(`Buscando "${searchTerm}" en todos los supermercados...`);
        
        const results = await searchAllMarkets(searchTerm);
        
        console.log('\nResultados ordenados por precio:');
        results.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.store}`);
            console.log(`Nombre: ${product.name}`);
            console.log(`Precio: ${product.price}`);
            console.log(`Link: ${product.link}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testSearch();