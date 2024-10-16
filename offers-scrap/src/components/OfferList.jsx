import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageCarousel from './ImageCarousel';
import OfferCard from './OfferCard';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const OfferList = () => {
  const [offers, setOffers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStore, setActiveStore] = useState('jumbo');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const stores = ['jumbo', 'carrefour', 'dia'];
        const offersData = {};

        for (const store of stores) {
          const response = await axios.get(`https://api-scrapper-market-fserewhvczgrfmh9.canadacentral-01.azurewebsites.net/api/offers/${store}`);
          offersData[store] = response.data;
        }

        setOffers(offersData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las ofertas');
        setLoading(false);
      }
    };

    fetchOffers();
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

  if (loading) return <div>Cargando ofertas...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{activeStore.charAt(0).toUpperCase() + activeStore.slice(1)} Ofertas</h2>
                {activeStore === 'carrefour' ? (
                  <ImageCarousel images={offers[activeStore]} />
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
