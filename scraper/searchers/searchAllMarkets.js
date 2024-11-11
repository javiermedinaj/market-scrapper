import searchJumboProduct from './searchJumbo.js';
import searchCarrefourProduct from './searchCarrefour.js';
import searchDiaProduct from './searchDia.js';

async function searchAllMarkets(productName) {
    try {
        console.log(`Buscando "${productName}" en todas las tiendas...`);

        const [jumboResults, carrefourResults, diaResults] = await Promise.all([
            searchJumboProduct(productName).catch(error => {
                console.error('Error en Jumbo:', error);
                return [];
            }),
            searchCarrefourProduct(productName).catch(error => {
                console.error('Error en Carrefour:', error);
                return [];
            }),
            searchDiaProduct(productName).catch(error => {
                console.error('Error en Dia:', error);
                return [];
            })
        ]);

        const allProducts = [
            ...jumboResults.map(product => ({ ...product, store: 'Jumbo' })),
            ...carrefourResults.map(product => ({ ...product, store: 'Carrefour' })),
            ...diaResults.map(product => ({ ...product, store: 'Dia' }))
        ];

        const cleanPrice = (price) => {
            if (!price || price === "Precio no encontrado") return Infinity;
            return Number(price.replace(/[^0-9,]/g, '').replace(',', '.'));
        };

        const sortedProducts = allProducts.sort((a, b) => {
            return cleanPrice(a.price) - cleanPrice(b.price);
        });
        console.log(`Búsqueda en todas las tiendas completada. Encontrados ${sortedProducts.length} productos.`);
        return sortedProducts;
    } catch (error) {
        console.error('Error en la búsqueda general:', error);
        throw error;
    }
}

export default searchAllMarkets;