import React from 'react';
import { useTheme } from '../context/ThemeContext';

const SearchResults = ({ results }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
      <div className="container mx-auto p-4">
        <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} text-center mt-2 bg-gradient-to-r from-accent-light to-accent bg-clip-text`}>
          Resultados de búsqueda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product, index) => (
            <div 
              key={index}
              className={`
                ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'}
                rounded-xl overflow-hidden
                shadow-lg hover:shadow-2xl
                transition-all duration-500
                transform hover:scale-[1.02]
                animate-fade-in
                border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
              `}
            >
              <div className="relative group">
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
              </div>
              <div className="p-6">
                <h3 className={`text-lg font-bold truncate mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {product.name}
                </h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent">
                  {product.price}
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tienda: {product.store}
                </p>
                <a 
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    mt-6 block w-full px-6 py-3
                    bg-gradient-to-r from-accent to-accent-dark
                    text-white font-medium text-center
                    rounded-full shadow-lg
                    transform hover:scale-[1.02] hover:shadow-xl
                    transition-all duration-300
                  `}
                >
                  Ver oferta
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;