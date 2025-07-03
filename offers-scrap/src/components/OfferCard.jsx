import { useTheme } from '../context/ThemeContext';

const OfferCard = ({ offer }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`
      ${darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
      }
      rounded-xl overflow-hidden
      shadow-lg hover:shadow-2xl
      transition-all duration-500 ease-out
      transform hover:scale-[1.03] hover:-translate-y-1
      animate-fade-in
      border group
    `}>
      <div className="relative overflow-hidden">
        {offer.image && (
          <img 
            src={offer.image} 
            alt={offer.name}
            className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
        
        {/* Price badge overlay */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-accent to-accent-dark text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transform translate-x-full group-hover:translate-x-0 transition-transform duration-300">
          {offer.price}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className={`
          text-lg font-bold mb-3 line-clamp-2 leading-tight
          ${darkMode ? 'text-gray-100' : 'text-gray-900'}
          group-hover:text-primary-500 transition-colors duration-300
        `}>
          {offer.name}
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent">
            {offer.price}
          </p>
          {offer.store && (
            <span className={`
              text-xs px-2 py-1 rounded-full font-medium
              ${darkMode 
                ? 'bg-gray-700 text-gray-300' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {offer.store}
            </span>
          )}
        </div>
        
        <a 
          href={offer.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`
            block w-full px-6 py-3 text-center font-semibold
            bg-gradient-to-r from-accent to-accent-dark
            text-white rounded-full shadow-lg
            transform hover:scale-105 hover:shadow-xl
            transition-all duration-300 ease-out
            hover:from-accent-dark hover:to-accent
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
            ${darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
          `}
        >
          Ver oferta
        </a>
      </div>
    </div>
  );
};
export default OfferCard;