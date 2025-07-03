import React, { useState } from "react";
import { ShoppingCart, Search, X } from 'lucide-react';

const Navbar = ({ onSearch, onClear }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    onClear();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">OffersBa</h1>
              <p className="text-xs text-gray-500">Mejores ofertas de supermercados</p>
            </div>
          </div>
{/* 
          Search Form
          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos en todos los supermercados..."
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         bg-gray-50 text-gray-900 placeholder-gray-500
                         transition-colors duration-200"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </form> */}

          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">6 Supermercados</p>
              <p className="text-xs text-gray-500">Datos actualizados</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
