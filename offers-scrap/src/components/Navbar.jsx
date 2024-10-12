import React from 'react';

const Navbar = () => {


  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Ofertas</h1>
      <button className="bg-gray-800 text-white p-2 rounded-full">
        🛒
      </button>
    </nav>
  );
};

export default Navbar;