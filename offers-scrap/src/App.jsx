import React from 'react';
import OfferList from './components/OfferList';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <OfferList />
    </ThemeProvider>
  );
}