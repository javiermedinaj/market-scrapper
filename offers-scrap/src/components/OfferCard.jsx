import React from 'react';

const OfferCard = ({ offer }) => {
  return (
    <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden m-4 transition-transform transform hover:scale-105 hover:shadow-xl">
      <img 
        src={offer.image} 
        alt={offer.name} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-white truncate">{offer.name}</h3>
        <p className="mt-2 text-white">Precio: {offer.price}</p>
        <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors">
          <a href={offer.link} target="_blank" rel="noopener noreferrer">Ver oferta</a> 
        </button>
      </div>
    </div>
  );
};

export default OfferCard;
