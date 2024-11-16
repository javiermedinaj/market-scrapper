import React, { useState, useEffect } from 'react';

const ImageGrid = ({ images, linkUrl }) => { 
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <button className="mt-4 bg-sky-600 text-white py-2 px-4 rounded-full w-full">
        <a href={linkUrl} target="_blank" rel="noopener noreferrer">Ver más</a> 
      </button>
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-sky-600 text-white p-4 rounded-full shadow-md"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default ImageGrid;