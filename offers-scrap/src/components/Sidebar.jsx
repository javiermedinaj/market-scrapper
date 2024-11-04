import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ stores, activeStore, onStoreSelect }) => {
  const { darkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-18 left-1 z-50 p-2 rounded-full shadow-lg transition-colors duration-300"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>
      <div 
        className={`
          ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} 
          fixed md:static top-0 left-0 h-full w-64 
          transition-all duration-300 transform shadow-lg
          md:translate-x-0 z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 mt-16 md:mt-0">
          <h2 className="text-2xl font-bold mb-6">Mercados</h2>
          <ul className="space-y-3">
            {stores.map((store) => (
              <li key={store}>
                <button 
                  className={`
                    block w-full text-left p-3 rounded-lg
                    transition-all duration-300 transform hover:scale-105
                    ${activeStore === store 
                      ? darkMode 
                        ? 'bg-gray-700 text-white shadow-lg' 
                        : 'bg-black text-white shadow-lg'
                      : darkMode
                        ? 'bg-gray-700/50 text-gray-200 hover:bg-gray-700/80'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                  onClick={() => {
                    onStoreSelect(store);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {store.charAt(0).toUpperCase() + store.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;