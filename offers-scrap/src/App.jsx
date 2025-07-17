import React, { useState } from 'react';
import Navbar from './components/Navbar';
import OfferList from './components/OfferList';
import { useTheme } from './context/ThemeContext';
import Searcher from './components/Searcher';

export default function App() {
  const { darkMode } = useTheme();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Searcher className="mb-6" />
        <OfferList />
      </main>
    </div>
  );
}