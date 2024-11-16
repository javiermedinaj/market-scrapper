import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { ShoppingCart, Search } from 'lucide-react';

const Navbar = ({ onSearch }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <nav className={`
      ${darkMode ?'bg-gradient-to-br from-gray-900 to-gray-800' 
      : 'bg-gradient-to-br from-white to-gray-50'} 
      sticky top-0 z-50 px-6 py-4 
      shadow-lg backdrop-blur-sm
    `}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <ShoppingCart size={32} className={`${darkMode ? "text-white" : "text-black"} transition-colors duration-300`} />
            {/* <span className={`text-xl font-bold ${darkMode ? "text-white" : "text-black"} hidden sm:block`}>
              OffersBa
            </span> */}
          </a>
        </div>

        {/* <div className="hidden md:block max-w-xl flex-1 mx-4">
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className={`
                ${darkMode ? "bg-dark-100 text-black" : "bg-gray-50"} 
                w-full px-6 py-2.5 rounded-l-full
                border-2 border-r-0 
                ${darkMode ? 'border-dark-100' : 'border-gray-100'}
                focus:outline-none focus:border-primary-500
                transition-all duration-300
              `}
            />
            <button
              type="submit"
              className={`
                px-6 py-2.5 rounded-r-full
                bg-primary-600 text-white
                hover:bg-primary-700
                transition-colors duration-300
                flex items-center
              `}
            >
              <Search size={20} />
            </button>
          </form>
        </div> */}

        <button
          onClick={toggleDarkMode}
          className={`
            p-2.5 rounded-full
            ${darkMode ? "bg-dark-100 text-white" : "bg-gray-100"}
            hover:scale-110
            transition-all duration-300
          `}
        >
          {darkMode ? "🌙" : "☀️"}
        </button>
      </div>
      {/*
      <div className="md:hidden mt-4">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className={`
              ${darkMode ? "bg-dark-100 text-white" : "bg-gray-50"} 
              w-full px-4 py-2 rounded-l-full
              border-2 border-r-0 
              ${darkMode ? 'border-dark-100' : 'border-gray-100'}
              focus:outline-none focus:border-primary-500
              transition-all duration-300
            `}
          />
          <button
            type="submit"
            className={`
              px-4 py-2 rounded-r-full
              bg-primary-600 text-white
              hover:bg-primary-700
              transition-colors duration-300
              flex items-center
            `}
          >
            <Search size={18} />
          </button>
        </form>
      </div>
      */}
    </nav>
  );
};

export default Navbar;