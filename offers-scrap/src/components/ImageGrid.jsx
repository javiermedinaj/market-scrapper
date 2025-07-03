import React, { useState, useEffect } from 'react';
import { ChevronUp, ExternalLink, Grid } from 'lucide-react';

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

  if (!images || images.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 text-center">
        <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg 
                     transition-all duration-300 hover:scale-[1.02] group"
          >
            <img
              src={image.image}
              alt={image.name || `Oferta ${index + 1}`}
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            
            <div className="hidden w-full h-48 items-center justify-center bg-gray-100">
              <Grid size={40} className="text-gray-400" />
            </div>

            {image.name && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300
                           flex items-end">
                <p className="text-white text-sm font-medium p-3 truncate">
                  {image.name}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {linkUrl && (
        <a 
          href={linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 
                   rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
                   shadow-md hover:shadow-lg"
        >
          <span>Ver más ofertas</span>
          <ExternalLink size={16} />
        </a>
      )}

      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white 
                   p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
                   hover:scale-110 z-50"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
};

export default ImageGrid;