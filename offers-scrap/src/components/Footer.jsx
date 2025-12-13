import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black dark:bg-black border-t border-gray-800 py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">
          OfertasBA
        </div>
        <p className="text-white dark:text-white mb-2 text-lg">
          Las mejores ofertas de Buenos Aires en un solo lugar
        </p>
        <p className="text-gray-400 dark:text-gray-400 text-sm">
          © {currentYear} OfertasBA. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

