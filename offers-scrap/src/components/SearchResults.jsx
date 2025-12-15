import PropTypes from 'prop-types';
import { ExternalLink, Tag, Search } from 'lucide-react';

const SearchResults = ({ results }) => {
  const formatPrice = (price) => {
    if (!price) return 'Consultar precio';
    return price.toString().replace(/[^\d.,]/g, '').trim() || price;
  };

  const getStoreColor = (store) => {
    const colors = {
      'Jumbo': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'Carrefour': 'bg-blue-100 dark:bg-blue-100/30 text-blue-800 dark:text-gray-100',
      'Farmacity': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'Día': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      'Farma': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      'Coto': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    };
    return colors[store] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h2>
            <p className="text-gray-600 dark:text-gray-400">Intenta con otros términos de búsqueda</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Resultados de búsqueda</h2>
          <p className="text-gray-600 dark:text-gray-400">Se encontraron {results.length} productos</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700
                         transition-all duration-300 hover:scale-[1.02] overflow-hidden group"
            >
              <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                {product.image && product.image !== 'Imagen no encontrada' ? (
                  <img 
                    src={product.image} 
                    alt={product.name || 'Producto'}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                                <div className={`${product.image && product.image !== 'Imagen no encontrada' ? 'hidden' : 'flex'} 
                                w-full h-48 items-center justify-center bg-gray-100 dark:bg-gray-700`}>
                  <Tag size={40} className="text-gray-400 dark:text-gray-500" />
                </div>
                {product.store && (
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStoreColor(product.store)}`}>
                      {product.store}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col h-40">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 flex-grow">
                  {product.name || 'Producto sin nombre'}
                </h3>

                <div className="mb-3">
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(product.price)}
                  </p>
                </div>
                {product.link && product.link !== '' ? (
                  <a 
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 
                             rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
                             text-sm group-hover:bg-blue-700"
                  >
                    <span>Ver en tienda</span>
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium py-2 px-4 
                                 rounded-lg text-center text-sm">
                    Enlace no disponible
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

SearchResults.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      image: PropTypes.string,
      store: PropTypes.string,
      link: PropTypes.string,
    })
  ),
};

SearchResults.defaultProps = {
  results: [],
};

export default SearchResults;