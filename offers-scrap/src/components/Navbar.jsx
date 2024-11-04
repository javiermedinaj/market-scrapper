import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onSearch }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <nav className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-lg p-4 flex justify-between items-center transition-colors duration-300`}>
      <h1 className="text-1xl font-bold">OffersBa</h1>
      <div className="flex items-center gap-4">
        {/* <input 
          type="text" 
          placeholder="Buscar productos..." 
          onChange={(e) => onSearch(e.target.value)}
          className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300`}
        /> */}
        <button 
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;