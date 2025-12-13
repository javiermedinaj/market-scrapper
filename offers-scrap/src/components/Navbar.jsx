import React from "react";
import { ShoppingCart, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CirclePercent } from 'lucide-react';

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <CirclePercent size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-500">OfertasBA</h1>
              <p className="text-xs text-gray-400">Las mejores ofertas de supermercados</p>
            </div>
          </div>
          {/*<div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-400" />
              )}
            </button>

            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm font-medium text-white">6 Supermercados</p>
                <p className="text-xs text-gray-400">Datos actualizados</p>
              </div>
            </div>
          </div>*/}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
