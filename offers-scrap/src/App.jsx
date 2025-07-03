import React, { useState } from 'react';
import Navbar from './components/Navbar';
import OfferList from './components/OfferList';
import SearchResults from './components/SearchResults';
import { Loader, AlertCircle } from 'lucide-react';

export default function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setError('No se pudo realizar la búsqueda. Verifica que el servidor esté funcionando.');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={handleSearch} onClear={clearSearch} />
      
      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Buscando ofertas...</p>
            </div>
          </div>  
        ) : searchResults ? (
          <SearchResults results={searchResults} onClear={clearSearch} />
        ) : (
          <OfferList />
        )}
      </main>
    </div>
  );
}