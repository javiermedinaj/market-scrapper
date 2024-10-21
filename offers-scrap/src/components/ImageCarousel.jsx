import React from 'react';

const ImageGrid = ({ images }) => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative overflow-hidden rounded-lg shadow-md">
            <img
              src={image.image}
              alt={`Oferta ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500"
            />
          </div>
        ))}
      </div>
      <button className="mt-4 bg-black text-white py-2 px-4 rounded-full w-full">
        <a href="https://www.carrefour.com.ar/promociones" target="_blank" rel="noopener noreferrer">Ver más</a>
      </button>
    </div>
  );
};

export default ImageGrid;