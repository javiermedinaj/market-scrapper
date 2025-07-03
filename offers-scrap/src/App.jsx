import React, { useState } from 'react';
import Navbar from './components/Navbar';
import OfferList from './components/OfferList';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Navbar onSearch={handleSearch} />
        <OfferList searchQuery={searchQuery} />
      </div>
    </ThemeProvider>
  );
}