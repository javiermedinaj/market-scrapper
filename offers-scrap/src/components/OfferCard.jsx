import { useTheme } from '../context/ThemeContext';

const OfferCard = ({ offer }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`
      ${darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-white to-gray-50'}
      rounded-xl overflow-hidden
      shadow-lg hover:shadow-2xl
      transition-all duration-500
      transform hover:scale-[1.02]
      animate-fade-in
      border ${darkMode ? 'border-gray-800' : 'border-gray-100'}
    `}>
      <div className="relative group">
        <img 
          src={offer.image} 
          alt={offer.name} 
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
      </div>
      <div className="p-6">
        <h3 className={`text-lg font-bold truncate mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {offer.name}
        </h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent">
          {offer.price}
        </p>
        {offer.store && (
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {offer.store}
          </p>
        )}
        <a 
          href={offer.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`
            mt-6 block w-full px-6 py-3
            bg-gradient-to-r from-accent to-accent-dark
            text-white font-medium text-center
            rounded-full shadow-lg
            transform hover:scale-[1.02] hover:shadow-xl
            transition-all duration-300
          `}
        >
          Ver oferta
        </a>
      </div>
    </div>
  );
};
export default OfferCard;