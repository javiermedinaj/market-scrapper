import React, { useState } from "react";
import { ShoppingCart, Search, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onSearch, onClear }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { darkMode, toggleDarkMode } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    onClear();
  };

  return (
    <nav className="bg-white dark:bg-black shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">OffersBa</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mejores ofertas de supermercados</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">6 Supermercados</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Datos actualizados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
