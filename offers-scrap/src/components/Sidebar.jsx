import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Menu, X } from 'lucide-react';

const Sidebar = ({ stores, activeStore, onStoreSelect }) => {
  const { darkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className={`
          md:hidden fixed top-20 left-4 z-50 p-3 rounded-full shadow-lg
          ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          hover:scale-110 transition-all duration-300
          border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-white to-gray-50'} 
          fixed md:static top-0 left-0 min-h-screen w-64 
          transition-all duration-300 transform shadow-lg
          md:translate-x-0 z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 pt-20 md:pt-6">
          <h2 className={`
            text-2xl font-bold mb-6 
            ${darkMode ? 'text-white' : 'text-gray-900'}
            bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent
          `}>
            Mercados
          </h2>
          
          <ul className="space-y-2">
            {stores.map((store) => (
              <li key={store}>
                <button 
                  className={`
                    block w-full text-left p-4 rounded-lg font-medium
                    transition-all duration-300 transform hover:scale-105
                    ${activeStore === store 
                      ? `bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg scale-105` 
                      : darkMode
                        ? 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                    focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                    ${darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
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