import React, { useState } from 'react';
import Navbar from './components/Navbar';
import OfferList from './components/OfferList';
import SearchResults from './components/SearchResults';
import { ThemeProvider } from './context/ThemeContext';
import { Loader } from 'lucide-react';

export default function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Navbar onSearch={handleSearch} />
        {isLoading ? (
          <div className="flex justify-center items-center mt-10">
            <Loader className='animate-spin w-12 h-12' />
          </div>  
        ) : searchResults ? (
          <SearchResults results={searchResults} />
        ) : (
          <OfferList />
        )}
      </div>
    </ThemeProvider>
  );
}