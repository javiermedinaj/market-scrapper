import React, { useState, useEffect } from 'react';
import ImageGrid from './ImageGrid';
import OfferCard from './OfferCard';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import diaOffers from '../../../scraper/data/dia-ofertas.json';
import jumboOffers from '../../../scraper/data/jumbo-ofertas.json';
import carrefourOffers from '../../../scraper/data/carrefour-ofertas.json';
import { useTheme } from '../context/ThemeContext';
const OfferList = () => {
  const [offers, setOffers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStore, setActiveStore] = useState('jumbo');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { darkMode } = useTheme();

  useEffect(() => {
    try {
      const offersData = {
        dia: diaOffers,
        jumbo: jumboOffers,
        carrefour: carrefourOffers
      };

      setOffers(offersData);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las ofertas');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const results = [];
      for (const store in offers) {
        const storeOffers = offers[store].filter(offer =>
          offer.name && offer.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        results.push(...storeOffers);
      }
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, offers]);

  if (loading) return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary"></div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} transition-colors duration-300`}>
      <Navbar onSearch={setSearchTerm} />
      <div className="flex flex-col md:flex-row">
        <Sidebar
          stores={['jumbo', 'carrefour', 'dia']}
          activeStore={activeStore}
          onStoreSelect={(store) => setActiveStore(store)}
        />
        <div className="flex-1 p-8">
          {searchTerm ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">Resultados de búsqueda</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((offer, index) => (
                  <OfferCard key={index} offer={offer} />
                ))}
              </div>
            </div>
          ) : (
            offers[activeStore] && (
              <div className="mb-8 mt-4">
                <h2 className="text-2xl font-bold mb-8 text-center">{activeStore.charAt(0).toUpperCase() + activeStore.slice(1)} Ofertas</h2>
                {activeStore === 'carrefour' ? (
                  <ImageGrid images={offers[activeStore]} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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