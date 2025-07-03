import React, { useState, useEffect } from 'react';
import ImageGrid from './ImageGrid';
import OfferCard from './OfferCard';
import Sidebar from './Sidebar';
import { LoadingSkeletonGrid } from './LoadingSkeleton';
import { useTheme } from '../context/ThemeContext';
import diaOffers from '../../../scraper/data/dia-ofertas.json';
import jumboOffers from '../../../scraper/data/jumbo-ofertas.json';
import carrefourOffers from '../../../scraper/data/carrefour-ofertas.json';
import cotoOffers from '../../../scraper/data/coto-ofertas.json';
import farmacityOffers from '../../../scraper/data/farmacity-ofertas.json'; 
import farmaonline from '../../../scraper/data/farma-ofertas.json'; 

const OfferList = ({ searchQuery }) => {
  const [offers, setOffers] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeStore, setActiveStore] = useState('jumbo');
  const [searchResults, setSearchResults] = useState([]);
  const { darkMode } = useTheme();

  useEffect(() => {
    try {
      const offersData = {
        dia: diaOffers,
        jumbo: jumboOffers,
        carrefour: carrefourOffers,
        coto: cotoOffers,
        farmacity: farmacityOffers,
        farmaonline: farmaonline
      };

      setOffers(offersData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading offers:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = [];
      for (const store in offers) {
        const storeOffers = offers[store].filter(offer =>
          offer.name && offer.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        results.push(...storeOffers);
      }
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, offers]);

  if (loading) return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-white'} transition-colors duration-300`}>
      <div className="flex flex-col md:flex-row">
        <Sidebar
          stores={['jumbo', 'carrefour', 'dia', 'farmacity', 'farmaonline', 'coto']}
          activeStore={activeStore}
          onStoreSelect={(store) => setActiveStore(store)}
        />
        <div className="flex-1 p-8 md:ml-0">
          <div className="mb-8 mt-4">
            <div className={`h-8 w-48 rounded mb-8 mx-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
            <LoadingSkeletonGrid count={12} />
          </div>
        </div>
      </div>
    </div>
  );

  const getLinkUrl = (store) => {
    switch(store) {
      case 'carrefour':
        return 'https://www.carrefour.com.ar/promociones';
      case 'coto':
        return 'https://www.coto.com.ar/';
      default:
        return '#'; 
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-white'} transition-colors duration-300`}>
      <div className="flex flex-col md:flex-row">
        <Sidebar
          stores={['jumbo', 'carrefour', 'dia', 'farmacity', 'farmaonline', 'coto']}
          activeStore={activeStore}
          onStoreSelect={(store) => setActiveStore(store)}
        />
        <div className="flex-1 p-4 md:p-8 md:ml-0">
          {searchQuery ? (
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Resultados de búsqueda
                </h2>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {searchResults.length} productos encontrados para "{searchQuery}"
                </p>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((offer, index) => (
                    <OfferCard key={index} offer={offer} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    🔍
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No se encontraron productos
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              )}
            </div>
          ) : (
            offers[activeStore] && (
              <div className="mb-8 mt-4">
                <div className="text-center mb-8">
                  <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {activeStore.charAt(0).toUpperCase() + activeStore.slice(1)} Ofertas
                  </h2>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {offers[activeStore].length} ofertas disponibles
                  </p>
                </div>
                
                {(activeStore === 'carrefour' || activeStore === 'coto') ? (
                  <div className="max-w-4xl mx-auto">
                    <ImageGrid 
                      images={offers[activeStore]} 
                      linkUrl={getLinkUrl(activeStore)} 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {offers[activeStore].map((offer, index) => (
                      <OfferCard key={index} offer={offer} />
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferList;