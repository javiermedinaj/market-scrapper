import React from 'react';
import { ExternalLink, Tag, Search } from 'lucide-react';

const SearchResults = ({ results }) => {
  const formatPrice = (price) => {
    if (!price) return 'Consultar precio';
    return price.toString().replace(/[^\d.,]/g, '').trim() || price;
  };

  const getStoreColor = (store) => {
    const colors = {
      'Jumbo': 'bg-green-100 text-green-800',
      'Carrefour': 'bg-blue-100 text-blue-800',
      'Farmacity': 'bg-purple-100 text-purple-800',
      'Día': 'bg-red-100 text-red-800',
      'Farma': 'bg-orange-100 text-orange-800',
      'Coto': 'bg-yellow-100 text-yellow-800'
    };
    return colors[store] || 'bg-gray-100 text-gray-800';
  };

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No se encontraron resultados</h2>
            <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Resultados de búsqueda</h2>
          <p className="text-gray-600">Se encontraron {results.length} productos</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 
                         transition-all duration-300 hover:scale-[1.02] overflow-hidden group"
            >
              {/* Imagen del producto */}
              <div className="relative overflow-hidden bg-gray-100">
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
                
                {/* Fallback cuando no hay imagen */}
                <div className={`${product.image && product.image !== 'Imagen no encontrada' ? 'hidden' : 'flex'} 
                                w-full h-48 items-center justify-center bg-gray-100`}>
                  <Tag size={40} className="text-gray-400" />
                </div>

                {/* Badge de la tienda */}
                {product.store && (
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStoreColor(product.store)}`}>
                      {product.store}
                    </span>
                  </div>
                )}
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4 flex flex-col h-40">
                {/* Nombre del producto */}
                <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 flex-grow">
                  {product.name || 'Producto sin nombre'}
                </h3>

                {/* Precio */}
                <div className="mb-3">
                  <p className="text-xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Botón de enlace */}
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
                  <div className="w-full bg-gray-100 text-gray-500 font-medium py-2 px-4 
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

export default SearchResults;