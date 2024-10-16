import React from 'react';

const OfferCard = ({ offer }) => {
  return (
    <div className="bg-gray-100 shadow-lg rounded-lg overflow-hidden m-4 transition-transform transform hover:scale-105 hover:shadow-xl">
      <img 
        src={offer.image} 
        alt={offer.name} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-black truncate">{offer.name}</h3>
        <p className="text-2xl font-bold mt-2">{offer.price}</p>
        <button className="mt-4 bg-black text-white py-2 px-4 rounded-full w-full">
          <a href={offer.link} target="_blank" rel="noopener noreferrer">Ver oferta</a> 
        </button>
      </div>
    </div>
  );
};

export default OfferCard;
